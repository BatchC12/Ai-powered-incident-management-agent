"""
Security utilities: password hashing (PBKDF2) and JWT token management.
Supports ITIL roles: end_user, support_staff, problem_manager, system_admin, it_service_manager.
"""
import datetime
import hashlib
import os
from typing import Optional, Dict, Any

import jwt

from app.core.config import settings

ALGORITHM = "HS256"

# Valid ITIL persona roles
VALID_ROLES = [
    "end_user",
    "support_staff",
    "problem_manager",
    "system_admin",
    "it_service_manager",
]


def get_password_hash(password: str) -> str:
    """Generate salted PBKDF2-HMAC-SHA256 password hash."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return salt.hex() + ":" + key.hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain text password against stored hash."""
    if not hashed_password:
        return False
    try:
        if ":" not in hashed_password:
            return plain_password == hashed_password
        salt_hex, key_hex = hashed_password.split(":", 1)
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000)
        return new_key == key
    except Exception:
        return False


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[datetime.timedelta] = None,
) -> str:
    """Generate JWT access token."""
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (
        expires_delta
        or datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate JWT access token."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
