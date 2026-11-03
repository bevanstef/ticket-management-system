"""Authentication router for FastAPI.

Provides a ``POST /auth/login`` endpoint that validates a username/password
pair against the ``users`` table and returns a JWT access token.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models, auth, dependencies

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginForm(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(form: LoginForm, db: Session = Depends(dependencies.get_db)):
    stmt = models.users.select().where(models.users.c.username == form.username)
    user_row = db.execute(stmt).first()
    if not user_row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Incorrect username or password")
    if not auth.verify_password(form.password, user_row.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Incorrect username or password")
    access_token = auth.create_access_token({"sub": user_row.username})
    return {"access_token": access_token, "token_type": "bearer"}

