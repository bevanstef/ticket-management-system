"""Authentication utilities for FastAPI backend.

Provides:
* Password hashing / verification (bcrypt via passlib)
* JWT creation and validation
* OAuth2PasswordBearer scheme for FastAPI dependencies
"""

from datetime import datetime, timedelta
from typing import Optional

from passlib.context import CryptContext
from jose import JWTError, jwt

# ---------------------------------------------------------------------------
# Password handling (bcrypt)
# ---------------------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return ``True`` if ``plain_password`` matches ``hashed_password``."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a plain password using the configured ``pwd_context``."""
    return pwd_context.hash(password)

# ---------------------------------------------------------------------------
# JWT handling
# ---------------------------------------------------------------------------

SECRET_KEY: str = "replace-this-with-a-secure-random-secret"
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT token.
 
    ``data`` should contain at least a ``"sub"`` key with the username.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode a JWT token and return its payload.

    Raises ``JWTError`` on failure.
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

# ---------------------------------------------------------------------------
# FastAPI OAuth2 scheme (used in dependencies)
# ---------------------------------------------------------------------------
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

