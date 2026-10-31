"""Common FastAPI dependencies used across routers.

* ``get_db`` – provides a SQLAlchemy Session (managed with ``yield``).
* Additional deps (e.g., auth) can be added later.
"""

from typing import Generator

from .database import SessionLocal

def get_db() -> Generator:
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

