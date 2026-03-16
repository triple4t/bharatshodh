from datetime import datetime, timezone
import os
from fastapi import APIRouter, HTTPException, Depends,BackgroundTasks
from models import UserCreate, UserLogin, UserPublic, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest, UserApprovalRequest, ApprovalResponse
from services.emailer import send_reset_email, send_approval_email, send_rejection_email
from database import get_database
from security import hash_password, verify_password, create_access_token, get_current_user, hash_value, generate_reset_token
from config import settings
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")  # Change in production

@router.post("/register", response_model=UserPublic)
async def register(payload: UserCreate):
    db = get_database()
    existing = await db.users.find_one({"email": payload.email.lower().strip()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
         "_id": str(uuid.uuid4()),
        # "_id": payload.email.lower().strip(),  # use email as _id for simplicity
        "email": payload.email.lower().strip(),
        "name": payload.name,
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
        "status": "pending",  # New users start as pending
        "approved_at": None,
    }
    await db.users.insert_one(doc)
    doc["_id"] = str(doc["_id"])
    return UserPublic(**doc)

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    db = get_database()
    user = await db.users.find_one({"email": payload.email.lower().strip()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Check if user account is approved
    if user.get("status") != "approved":
        status = user.get("status", "pending")
        if status == "pending":
            raise HTTPException(
                status_code=403,
                detail="Your account is currently on the waiting list. You’ll be notified by email when access becomes available."
            )
        elif status == "rejected":
            raise HTTPException(
                status_code=403,
                detail="Your account has been rejected. Please contact support."
            )
        else:
            raise HTTPException(status_code=403, detail="Your account is not active.")

    # Use user's _id as sub
    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(access_token=token, status="approved")

@router.get("/me", response_model=UserPublic)
async def me(current=Depends(get_current_user)):
    # normalize/return safe fields
    return UserPublic(
        _id=current["_id"],
        email=current["email"],
        name=current.get("name"),
        created_at=current.get("created_at"),
        status=current.get("status", "pending"),
    )

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    db = get_database()
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    # Do NOT reveal existence to client
    if not user:
        return {"msg": "If that email exists, you will receive a reset link."}

    token, token_hash, expiry = generate_reset_token()
    # store hash and expiry
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token_hash": token_hash, "reset_token_expiry": expiry, "reset_token_used": False}}
    )

    # build link (frontend will handle token param)
    reset_link = f"{settings.frontend_reset_url}?token={token}&email={email}"

    # send via SMTP in background
    background_tasks.add_task(send_reset_email, email, reset_link, settings.app_name)
    return {"msg": "If that email exists, you will receive a reset link."}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    db = get_database()
    now = datetime.now(timezone.utc)
    token_hash = hash_value(payload.token)

    user = await db.users.find_one({
        "reset_token_hash": token_hash,
        "reset_token_expiry": {"$gte": now},
        "reset_token_used": {"$ne": True}
    })
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # update password and clear token fields, set password_changed_at
    new_hash = hash_password(payload.new_password)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": new_hash, "password_changed_at": now},
         "$unset": {"reset_token_hash": "", "reset_token_expiry": "", "reset_token_used": ""}}
    )

    # Optionally, log this event
    # await db.audit.insert_one({...})

    return {"msg": "Password reset successful. Please log in with your new password."}


# ---------- ADMIN APPROVAL ENDPOINTS ----------

@router.get("/admin/pending-users")
async def get_pending_users(admin_token: str):
    """
    Get list of pending users waiting for approval.
    Requires admin authentication via admin_token.
    """
    # Simple token validation (in production, use proper JWT or OAuth)
    if admin_token != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db = get_database()
    pending_users = await db.users.find({"status": "pending"}).to_list(None)
    
    # Return without password_hash
    users = []
    for user in pending_users:
        user["_id"] = str(user["_id"])
        del user["password_hash"]
        users.append(user)
    
    return {"pending_users": users}


@router.post("/admin/approve-user", response_model=ApprovalResponse)
async def approve_user(payload: UserApprovalRequest, background_tasks: BackgroundTasks, admin_token: str):
    """
    Approve a pending user and send approval email.
    Requires admin authentication via admin_token.
    """
    # Simple token validation (in production, use proper JWT or OAuth)
    if admin_token != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db = get_database()
    
    # Find user by ID
    user = await db.users.find_one({"_id": payload.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("status") != "pending":
        raise HTTPException(status_code=400, detail="User is not in pending status")

    # Update user status to approved
    await db.users.update_one(
        {"_id": payload.user_id},
        {"$set": {"status": "approved", "approved_at": datetime.utcnow()}}
    )

    # Send approval email in background
    login_link = settings.frontend_login_url
    background_tasks.add_task(
        send_approval_email,
        user["email"],
        login_link,
        settings.app_name
    )

    return ApprovalResponse(
        msg=f"User {user['email']} has been approved",
        user_id=payload.user_id,
        status="approved"
    )


@router.post("/admin/reject-user", response_model=ApprovalResponse)
async def reject_user(payload: UserApprovalRequest, background_tasks: BackgroundTasks, admin_token: str):
    """
    Reject a pending user and send rejection email.
    Requires admin authentication via admin_token.
    """
    # Simple token validation (in production, use proper JWT or OAuth)
    if admin_token != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db = get_database()
    
    # Find user by ID
    user = await db.users.find_one({"_id": payload.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("status") != "pending":
        raise HTTPException(status_code=400, detail="User is not in pending status")

    # Update user status to rejected
    await db.users.update_one(
        {"_id": payload.user_id},
        {"$set": {"status": "rejected", "rejected_at": datetime.utcnow(), "rejection_reason": payload.reason}}
    )

    # Send rejection email in background
    background_tasks.add_task(
        send_rejection_email,
        user["email"],
        payload.reason,
        settings.app_name
    )

    return ApprovalResponse(
        msg=f"User {user['email']} has been rejected",
        user_id=payload.user_id,
        status="rejected"
    )
