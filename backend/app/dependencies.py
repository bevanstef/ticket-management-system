"""Common FastAPI dependencies used across routers.

* ``get_db`` – provides a SQLAlchemy Session (managed with ``yield``).
* ``get_current_user`` – validates JWT, returns ``{"id": int, "role": str}``.
"""

from typing import Generator, Dict

from fastapi import Depends, HTTPException, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import SessionLocal
from .auth import decode_access_token, JWTError as AuthJWTError, oauth2_scheme
from . import models

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a DB session and ensures it is closed.

    Usage::

        @router.get('/')
        def foo(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Dict[str, str]:
    """Validate the JWT token and retrieve the corresponding user.

    Returns a dict with ``id`` and ``role``. Raises ``401`` if validation fails.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    stmt = select(models.users).where(models.users.c.username == username)
    user = db.execute(stmt).first()
    if user is None:
        raise credentials_exception
    return {"id": user.id, "role": user.role}

