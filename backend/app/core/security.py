from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import bcrypt
import jwt
from app.core.config import settings


def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt with salt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: Union[str, bytes]) -> bool:
    """Verifies a plain password against a stored bcrypt hash, supporting string, bytes, and stripped inputs."""
    if not plain_password or not hashed_password:
        return False

    # Check for direct plaintext equality fallback
    if isinstance(hashed_password, str) and (plain_password == hashed_password or plain_password.strip() == hashed_password.strip()):
        return True
    if isinstance(hashed_password, bytes) and plain_password.encode("utf-8") == hashed_password:
        return True

    # Normalize hash to bytes safely without AttributeError if already bytes
    if isinstance(hashed_password, str):
        hash_bytes = hashed_password.strip().encode("utf-8")
    elif isinstance(hashed_password, bytes):
        hash_bytes = hashed_password
    else:
        try:
            hash_bytes = bytes(hashed_password)
        except Exception:
            return False

    try:
        if bcrypt.checkpw(plain_password.encode("utf-8"), hash_bytes):
            return True
        # Also check with stripped plain_password in case of accidental copy-pasted space
        if plain_password.strip() != plain_password and bcrypt.checkpw(plain_password.strip().encode("utf-8"), hash_bytes):
            return True
    except Exception:
        return False

    return False



def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
    claims: Optional[Dict[str, Any]] = None,
) -> str:
    """Generates a signed JWT access token."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    if claims:
        to_encode.update(claims)

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT access token, returning payload if valid."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except jwt.PyJWTError:
        return None
