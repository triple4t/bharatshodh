"""
Admin authentication and management router
"""
from datetime import datetime, timedelta, timezone
import os
import uuid
import shutil
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query, Header, UploadFile, File
from models import (
    AdminRegister, AdminLogin, AdminPublic, AdminTokenResponse,
    AdminStats, UserDetailResponse, DocumentInfo, DocumentUploadResponse
)
from services.emailer import send_approval_email, send_rejection_email
from services.document_service import document_service
from database import get_database
from security import hash_password, verify_password, create_access_token, hash_value
from config import settings
import jwt

router = APIRouter(prefix="/api/admin", tags=["admin"])

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours


def verify_admin_token(token: str = None):
    """Verify JWT token and return admin data"""
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id: str = payload.get("sub")
        admin_type: str = payload.get("type")
        
        if admin_id is None or admin_type != "admin":
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return admin_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_admin(authorization: str = Header(None, alias="Authorization")):
    """Dependency to get current admin from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")
        admin_id = verify_admin_token(token)
        return admin_id
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")


@router.post("/register", response_model=AdminPublic)
async def register_admin(payload: AdminRegister):
    """Register a new admin (first admin can self-register, others need approval)"""
    db = get_database()
    
    # Check if username already exists
    existing = await db.admins.find_one({"username": payload.username.lower().strip()})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists
    existing_email = await db.admins.find_one({"email": payload.email.lower().strip()})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if first admin (allow auto-approval for first admin)
    admin_count = await db.admins.count_documents({})
    is_first_admin = admin_count == 0
    
    doc = {
        "_id": str(uuid.uuid4()),
        "username": payload.username.lower().strip(),
        "email": payload.email.lower().strip(),
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
        "is_super_admin": is_first_admin,  # First admin is super admin
        "is_active": True,
    }
    
    await db.admins.insert_one(doc)
    doc["_id"] = str(doc["_id"])
    
    return AdminPublic(**doc)


@router.post("/login", response_model=AdminTokenResponse)
async def login_admin(payload: AdminLogin):
    """Admin login endpoint"""
    db = get_database()
    
    admin = await db.admins.find_one({"username": payload.username.lower().strip()})
    if not admin or not verify_password(payload.password, admin.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if not admin.get("is_active", True):
        raise HTTPException(status_code=403, detail="Admin account is inactive")
    
    # Create access token
    access_token_expires = timedelta(minutes=ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + access_token_expires
    
    to_encode = {
        "sub": admin["_id"],
        "type": "admin",
        "username": admin["username"],
        "exp": expire
    }
    
    access_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    admin["_id"] = str(admin["_id"])
    admin_public = AdminPublic(**admin)
    
    return AdminTokenResponse(
        access_token=access_token,
        token_type="bearer",
        admin=admin_public,
        username=admin["username"]
    )


@router.get("/me", response_model=AdminPublic)
async def get_admin_profile(authorization: str = Header(None, alias="Authorization")):
    """Get current admin profile"""
    admin_id = await get_current_admin(authorization)
    db = get_database()
    
    admin = await db.admins.find_one({"_id": admin_id})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    admin["_id"] = str(admin["_id"])
    return AdminPublic(**admin)


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(authorization: str = Header(None, alias="Authorization")):
    """Get user statistics"""
    admin_id = await get_current_admin(authorization)
    db = get_database()
    
    total_users = await db.users.count_documents({})
    pending_users = await db.users.count_documents({"status": "pending"})
    approved_users = await db.users.count_documents({"status": "approved"})
    rejected_users = await db.users.count_documents({"status": "rejected"})
    
    # Active users: approved users who logged in in last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users = await db.users.count_documents({
        "status": "approved",
        "last_login": {"$gte": thirty_days_ago}
    })
    
    total_admins = await db.admins.count_documents({})
    
    return AdminStats(
        total_users=total_users,
        pending_users=pending_users,
        approved_users=approved_users,
        rejected_users=rejected_users,
        active_users=active_users,
        total_admins=total_admins
    )


@router.get("/users")
async def get_all_users(
    authorization: str = Header(None, alias="Authorization"),
    status: str = Query(None, description="Filter by status: pending, approved, rejected"),
    search: str = Query(None, description="Search by email or name")
):
    """Get list of all users with optional filtering"""
    admin_id = await get_current_admin(authorization)
    db = get_database()
    
    query = {}
    
    if status:
        query["status"] = status
    
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}}
        ]
    
    users = await db.users.find(query).to_list(None)
    
    # Convert _id to string
    result = []
    for user in users:
        user["_id"] = str(user["_id"])
        result.append(UserDetailResponse(**user))
    
    return result


@router.get("/users/{user_id}", response_model=UserDetailResponse)
async def get_user_detail(user_id: str, authorization: str = Header(None, alias="Authorization")):
    """Get detailed information about a specific user"""
    admin_id = await get_current_admin(authorization)
    db = get_database()
    
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["_id"] = str(user["_id"])
    return UserDetailResponse(**user)


@router.post("/users/{user_id}/approve")
async def approve_user(user_id: str, authorization: str = Header(None, alias="Authorization"), background_tasks: BackgroundTasks = None):
    """Approve a pending user"""
    admin_id = await get_current_admin(authorization)
    db = get_database()
    
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get("status") != "pending":
        raise HTTPException(status_code=400, detail="User is not in pending status")
    
    # Update user status
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"status": "approved", "approved_at": datetime.now(timezone.utc)}}
    )
    
    # Send approval email
    login_link = os.getenv("FRONTEND_LOGIN_URL", "http://localhost:5173/signin")
    background_tasks.add_task(
        send_approval_email,
        user["email"],
        login_link,
        os.getenv("APP_NAME", "BharatShodh")
    )
    
    return {"msg": f"User {user['email']} has been approved", "status": "approved"}


@router.post("/users/{user_id}/reject")
async def reject_user(
    user_id: str,
    reason: str = Query(None),
    authorization: str = Header(None),
    background_tasks: BackgroundTasks = None
):
    """Reject a pending user"""
    admin_id = await get_current_admin(authorization)
    db = get_database()
    
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get("status") != "pending":
        raise HTTPException(status_code=400, detail="User is not in pending status")
    
    # Update user status
    await db.users.update_one(
        {"_id": user_id},
        {
            "$set": {
                "status": "rejected",
                "rejected_at": datetime.now(timezone.utc),
                "rejection_reason": reason or "Account does not meet requirements"
            }
        }
    )
    
    # Send rejection email
    background_tasks.add_task(
        send_rejection_email,
        user["email"],
        reason or None,
        os.getenv("APP_NAME", "BharatShodh")
    )
    
    return {"msg": f"User {user['email']} has been rejected", "status": "rejected"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, authorization: str = Header(None, alias="Authorization")):
    """Delete a user"""
    admin_id = await get_current_admin(authorization)
    db = get_database()
    
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = await db.users.delete_one({"_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete user")
    
    return {"msg": f"User {user['email']} has been deleted"}


@router.put("/users/{user_id}/toggle-status")
async def toggle_user_approval_status(user_id: str, new_status: str = Query(...), authorization: str = Header(None, alias="Authorization")):
    """Toggle user approval status"""
    admin_id = await get_current_admin(authorization)
    db = get_database()
    
    valid_statuses = ["pending", "approved", "rejected"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")
    
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {"status": new_status}
    
    if new_status == "approved":
        update_data["approved_at"] = datetime.utcnow()
        update_data["rejected_at"] = None
        update_data["rejection_reason"] = None
    elif new_status == "rejected":
        update_data["rejected_at"] = datetime.utcnow()
        update_data["approved_at"] = None
    elif new_status == "pending":
        update_data["rejected_at"] = None
        update_data["approved_at"] = None
    
    await db.users.update_one({"_id": user_id}, {"$set": update_data})
    
    return {"msg": f"User status changed to {new_status}", "status": new_status}


@router.post("/admins")
async def get_all_admins(authorization: str = Header(None, alias="Authorization")):
    """Get list of all admins (super admin only)"""
    admin_id = await get_current_admin(authorization)
    db = get_database()
    
    # Check if current admin is super admin
    admin = await db.admins.find_one({"_id": admin_id})
    if not admin.get("is_super_admin", False):
        raise HTTPException(status_code=403, detail="Only super admin can view admins")
    
    admins = await db.admins.find().to_list(None)
    
    result = []
    for adm in admins:
        adm["_id"] = str(adm["_id"])
        result.append(AdminPublic(**adm))
    
    return result


@router.delete("/admins/{admin_id}")
async def delete_admin(admin_id: str, authorization: str = Header(None, alias="Authorization")):
    """Delete an admin (super admin only)"""
    current_admin_id = await get_current_admin(authorization)
    db = get_database()
    
    # Check if current admin is super admin
    current_admin = await db.admins.find_one({"_id": current_admin_id})
    if not current_admin.get("is_super_admin", False):
        raise HTTPException(status_code=403, detail="Only super admin can delete admins")
    
    # Cannot delete self
    if current_admin_id == admin_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = await db.admins.delete_one({"_id": admin_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    return {"msg": "Admin has been deleted"}


# ---------- Admin Document Management ----------

@router.post("/documents/upload", response_model=DocumentUploadResponse)
async def upload_admin_document(
    file: UploadFile = File(...),
    authorization: str = Header(None, alias="Authorization")
):
    """Upload a document as admin (now supports large files via streaming)"""
    admin_id = await get_current_admin(authorization)
    
    try:
        # Validate file type
        allowed_extensions = [".pdf", ".docx", ".txt"]
        file_ext = os.path.splitext(file.filename or "")[1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )

        # NO FILE SIZE LIMIT - streaming handles large files!
        
        # Generate document ID
        doc_id = str(uuid.uuid4())
        
        # Save uploaded file (stream to disk, memory-safe regardless of size)
        upload_dir = getattr(settings, "upload_dir", "uploads")
        doc_dir = os.path.join(upload_dir, "documents")
        os.makedirs(doc_dir, exist_ok=True)
        file_path = os.path.join(doc_dir, f"{doc_id}_{file.filename}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(file_path)
        
        # Import background processor
        from services.document_processor import background_processor
        from models import DocumentStatus
        
        # Start background processing (non-blocking for large files!)
        background_processor.start_processing(
            doc_id=doc_id,
            file_path=file_path,
            uploaded_by=admin_id,
            doc_type="admin",
            filename=file.filename
        )

        return DocumentUploadResponse(
            message=f"Processing started for {file.filename} (admin document)",
            document=DocumentInfo(
                id=doc_id,
                filename=file.filename,
                upload_date=datetime.now(timezone.utc),
                uploaded_by=admin_id,
                doc_type="admin",
                file_size=file_size,
                chunk_count=0,
                status=DocumentStatus.PROCESSING
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        import logging
        logging.error(f"Error uploading admin document: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")


@router.get("/documents")
async def get_admin_documents_list(authorization: str = Header(None, alias="Authorization")):
    """Get all admin-uploaded documents"""
    admin_id = await get_current_admin(authorization)
    
    try:
        docs = await document_service.get_admin_documents()
        return {"documents": docs}
    except Exception as e:
        import logging
        logging.error(f"Error fetching admin documents: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch documents")


@router.delete("/documents/{doc_id}")
async def delete_admin_document(doc_id: str, authorization: str = Header(None, alias="Authorization")):
    """Delete an admin document"""
    admin_id = await get_current_admin(authorization)
    
    try:
        deleted = await document_service.delete_document(
            doc_id=doc_id,
            user_id=admin_id,
            is_admin=True
        )
        if not deleted:
            raise HTTPException(status_code=404, detail="Document not found")

        return {"msg": "Document deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logging.error(f"Error deleting admin document: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete document")
