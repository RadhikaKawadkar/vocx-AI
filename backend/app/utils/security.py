from datetime import datetime, timedelta
from typing import Optional, Any
import hashlib
import os
from app.config import settings

try:
    from jose import jwt, JWTError
except ImportError:
    try:
        import jwt
        class JWTError(Exception): pass
    except ImportError:
        jwt = None
        class JWTError(Exception): pass

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Secure salt + PBKDF2 hash using sha256."""
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"{salt.hex()}:{pwd_hash.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored salt:hash format."""
    try:
        if ":" not in hashed_password:
            return False
        salt_hex, pwd_hash_hex = hashed_password.split(":", 1)
        salt = bytes.fromhex(salt_hex)
        pwd_hash = bytes.fromhex(pwd_hash_hex)
        check_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
        return check_hash == pwd_hash
    except Exception:
        return False


def create_access_token(subject: str | Any, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {"exp": expire, "sub": str(subject)}
    if jwt:
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return f"demo-token-{subject}-{int(expire.timestamp())}"


def decode_access_token(token: str) -> Optional[dict]:
    if not jwt:
        if token.startswith("demo-token-"):
            parts = token.split("-")
            return {"sub": parts[2]}
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
