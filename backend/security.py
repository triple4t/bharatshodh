# from datetime import datetime, timedelta, timezone
# from typing import Optional, Dict, Any
# import bcrypt
# from jose import jwt
# from fastapi import HTTPException, Depends, Request
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from config import settings
# from database import get_database
# from bson import ObjectId

# bearer_scheme = HTTPBearer(auto_error=False)

# # -------- Password utils --------

# def hash_password(plain: str) -> str:
#     return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# def verify_password(plain: str, hashed: str) -> bool:
#     try:
#         return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
#     except Exception:
#         return False

# # -------- JWT utils --------

# def create_access_token(payload: Dict[str, Any], expires_minutes: int | None = None) -> str:
#     to_encode = payload.copy()
#     exp_min = expires_minutes or int(getattr(settings, "JWT_EXPIRES_MIN", 1440))
#     expire = datetime.now(timezone.utc) + timedelta(minutes=exp_min)
#     to_encode.update({"exp": expire})
#     token = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGO)
#     return token

# async def get_current_user(request: Request, creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> Dict[str, Any]:
#     if not creds or creds.scheme.lower() != "bearer":
#         raise HTTPException(status_code=401, detail="Not authenticated")

#     token = creds.credentials
#     try:
#         data = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGO])
#     except jwt.ExpiredSignatureError:
#         raise HTTPException(status_code=401, detail="Token expired")
#     except jwt.InvalidTokenError:
#         raise HTTPException(status_code=401, detail="Invalid token")

#     user_id = data.get("sub")
#     if not user_id:
#         raise HTTPException(status_code=401, detail="Invalid token payload")

#     db = get_database()
#     user = await db.users.find_one({"_id": user_id})
#     if not user:
#         raise HTTPException(status_code=401, detail="User not found")

#     # normalize id for downstream
#     user["_id"] = str(user["_id"])
#     return user


# security.py
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import bcrypt
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings
from database import get_database
import secrets
import hashlib


bearer_scheme = HTTPBearer(auto_error=False)

# -------- Password utils --------

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

# -------- JWT utils --------

def create_access_token(payload: Dict[str, Any], expires_minutes: Optional[int] = None) -> str:
    """
    Create JWT with exp and iat claims.
    payload: must include identifying 'sub' claim (e.g. user id).
    """
    to_encode = payload.copy()
    exp_min = expires_minutes or int(getattr(settings, "JWT_EXPIRES_MIN", 1440))
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=exp_min)

    # iat (issued at) is required to later check against password_changed_at
    to_encode.update({
        "exp": expire,
        "iat": int(now.timestamp())
    })
    token = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGO)
    return token

async def get_current_user(request: Request, creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> Dict[str, Any]:
    """
    Decode JWT, load user from DB, and check password_changed_at vs token iat.
    """
    if not creds or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = creds.credentials
    try:
        data = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGO])
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = data.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    db = get_database()
    user = await db.users.find_one({"_id": user_id})
    if not user:
        import logging
        logging.error(f"Auth failure: User not found for ID '{user_id}' in database")
        raise HTTPException(status_code=401, detail=f"User session invalid (user '{user_id}' not found)")

    # If user changed password after token issuance, invalidate the token
    token_iat = data.get("iat")
    if token_iat is not None:
        password_changed_at = user.get("password_changed_at")
        if password_changed_at:
            # ensure password_changed_at is a datetime object
            if isinstance(password_changed_at, str):
                try:
                    password_changed_at = datetime.fromisoformat(password_changed_at)
                except Exception:
                    try:
                        password_changed_at = datetime.fromtimestamp(float(password_changed_at), timezone.utc)
                    except Exception:
                        password_changed_at = None

            if password_changed_at:
                # normalize to UTC if naive
                if password_changed_at.tzinfo is None:
                    password_changed_at = password_changed_at.replace(tzinfo=timezone.utc)
                
                # Buffer of 1 second to account for slight timing differences during issuance
                if token_iat < int(password_changed_at.timestamp()):
                    import logging
                    logging.warning(f"Auth failure: Password was changed at {password_changed_at.isoformat()} which is after token iat {token_iat}")
                    raise HTTPException(status_code=401, detail="Security update found. Please log in again for your safety.")

    # normalize id for downstream
    user["_id"] = str(user["_id"])
    return user

# -------- Reset token helpers (for password reset flow) --------

RESET_TOKEN_TTL_MINUTES = settings.reset_token_ttl_minutes

def generate_reset_token():
    """
    Returns: (plaintext_token, token_hash_sha256, expiry_datetime_utc)
    - plaintext_token: send this to user via email
    - token_hash_sha256: store this in DB (never store plaintext token)
    - expiry: utc datetime when token expires
    """
    token = secrets.token_urlsafe(32)  # plaintext to send by email
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expiry = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)
    return token, token_hash, expiry

def hash_value(value: str) -> str:
    """Utility to compute sha256 hex digest of a string."""
    return hashlib.sha256(value.encode()).hexdigest()
