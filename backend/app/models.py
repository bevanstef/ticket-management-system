"""SQLAlchemy *Core* table definitions for the Ticket Management System."""    

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Table,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)

from .database import Base

# ---------------------------------------------------------------------------
# Ticket Types table (static reference data)
# ---------------------------------------------------------------------------

ticket_types = Table(
    "ticket_types",
    Base.metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("name", String(50), unique=True, nullable=False),
    Column("price", Integer, nullable=False),  # price in Rs
),

# ---------------------------------------------------------------------------
# Tickets table (main entity)
# ---------------------------------------------------------------------------

tickets = Table(
    "tickets",
    Base.metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("customer_name", String(100), nullable=False),
    Column("contact_number", String(20), nullable=False),
    Column("type_id", Integer, ForeignKey("ticket_types.id"), nullable=False),
    Column("ticket_price", Integer, nullable=False),
    Column("booked_at", DateTime, server_default=func.now(), nullable=False),
)

# Note: No ORM relationships – queries will join on ``type_id`` manually.

