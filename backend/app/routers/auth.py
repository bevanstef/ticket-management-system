"""Authentication router for FastAPI.

Provides a ``POST /auth/login`` endpoint that validates a username/password
pair against the ``users`` table and returns a JWT access token.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models, auth, dependencies, schemas

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginForm(BaseModel):
    username: str
    password: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(dependencies.get_db)):
    """Register a new customer account."""
    clean_username = user_in.username.strip()
    if not clean_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username cannot be empty",
        )

    stmt = models.users.select().where(models.users.c.username == clean_username)
    existing_user = db.execute(stmt).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered. Please choose another username.",
        )

    hashed_pwd = auth.get_password_hash(user_in.password)
    ins_stmt = (
        models.users.insert()
        .values(
            username=clean_username,
            hashed_password=hashed_pwd,
            role="customer",
        )
        .returning(models.users.c.id, models.users.c.username, models.users.c.role)
    )
    result = db.execute(ins_stmt)
    db.commit()
    new_user = result.first()

    access_token = auth.create_access_token(
        {"sub": new_user.username, "role": new_user.role}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": new_user.username,
        "role": new_user.role,
        "message": "User registered successfully",
    }


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
    access_token = auth.create_access_token({"sub": user_row.username, "role": user_row.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user_row.username,
        "role": user_row.role,
    }

