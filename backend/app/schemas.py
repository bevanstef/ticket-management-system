"""Pydantic schemas for request and response models.

These schemas are used by FastAPI to validate inbound data and to shape the
JSON returned to the client. They mirror the SQLAlchemy Core tables defined in
``models.py`` but expose only the fields needed for the API.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, validator


class TicketTypeBase(BaseModel):
    name: str = Field(..., max_length=50)

    class Config:
        orm_mode = True


class TicketTypeCreate(TicketTypeBase):
    pass


class TicketTypeRead(TicketTypeBase):
    id: int
    price: int


class TicketBase(BaseModel):
    customer_name: str = Field(..., max_length=100)
    contact_number: str = Field(..., max_length=20)
    type_id: int
    # The price is derived from the ticket type – client does not send it.
    # It is optional for input; FastAPI will fill it in via the CRUD logic.
    ticket_price: Optional[int] = Field(
        None,
        gt=0,
        description="Ticket price – calculated from the ticket type.",
    )
    booked_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class TicketCreate(TicketBase):
    # booked_at defaults to now on the DB side, but client can optionally send it
    pass


class TicketRead(TicketBase):
    id: int
    booked_at: datetime
    type: TicketTypeRead


# ---------------------------------------------------------------------------
# User schemas (Authentication & Registration)
# ---------------------------------------------------------------------------

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100, description="Plain text password (min 6 characters)")


class UserRead(UserBase):
    id: int
    role: str

    class Config:
        orm_mode = True



