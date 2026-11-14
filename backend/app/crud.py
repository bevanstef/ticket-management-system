"""Functional CRUD helpers for the Ticket Management API.

All operations are plain functions that accept a ``Session`` (or ``Connection``)
and work directly with the SQLAlchemy Core ``Table`` objects defined in
``models.py``.  No classes, no ORM objects – this matches the supervisor's
requirement for a functional style.

The price of a ticket is **fixed** per ticket type and stored in the
``ticket_types`` table.  When a new ticket is created we look up the price based
on ``type_id`` and insert it into the ``tickets`` table.  The ``TicketRead``
schema in ``schemas.py`` expects a ``ticket_price`` field, which we compute on
the fly.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy import select, insert, update, delete
from sqlalchemy.engine import Result
from sqlalchemy.orm import Session

from .models import tickets, ticket_types
from .schemas import TicketCreate, TicketRead, TicketTypeRead

# ---------------------------------------------------------------------------
# Helper utilities (pure functions)
# ---------------------------------------------------------------------------

def _get_price_for_type(session: Session, type_id: int) -> int:
    """Return the fixed price for the given ``type_id``.

    Raises ``ValueError`` if the ``type_id`` does not exist.
    """
    stmt = select(ticket_types.c.price).where(ticket_types.c.id == type_id)
    price_row = session.execute(stmt).first()
    if price_row is None:
        raise ValueError(f"Ticket type {type_id} not found")
    return price_row[0]


def _row_to_ticket_read(row: Tuple) -> TicketRead:
    """Convert a raw ``tickets`` row (joined with ``ticket_types``) into a
    ``TicketRead`` Pydantic model.
    """
    (
        id,
        event_name,
        customer_name,
        contact_number,
        type_id,
        ticket_price,
        booked_at,
        type_name,
        type_price,
    ) = row
    ticket_type = TicketTypeRead(id=type_id, name=type_name, price=type_price)
    return TicketRead(
        id=id,
        event_name=event_name or "Colombo Music Carnival & Baila Night",
        customer_name=customer_name,
        contact_number=contact_number,
        type_id=type_id,
        ticket_price=ticket_price,
        booked_at=booked_at,
        type=ticket_type,
    )

# ---------------------------------------------------------------------------
# CRUD operations
# ---------------------------------------------------------------------------

def create_ticket(session: Session, payload: TicketCreate) -> TicketRead:
    """Insert a new ticket.

    * ``payload`` is a ``TicketCreate`` Pydantic model (validated by FastAPI).
    * The price is looked up from ``ticket_types`` based on ``payload.type_id``.
    * ``booked_at`` defaults to ``datetime.utcnow()`` on the DB side.
    """
    price = _get_price_for_type(session, payload.type_id)
    event_title = payload.event_name or "Colombo Music Carnival & Baila Night"
    stmt = insert(tickets).values(
        event_name=event_title,
        customer_name=payload.customer_name,
        contact_number=payload.contact_number,
        type_id=payload.type_id,
        ticket_price=price,
    ).returning(*tickets.c)
    result: Result = session.execute(stmt)
    session.commit()
    ticket_row = result.first()
    # Join with ticket_types to include the nested ``type`` field
    join_stmt = (
        select(
            tickets.c.id,
            tickets.c.event_name,
            tickets.c.customer_name,
            tickets.c.contact_number,
            tickets.c.type_id,
            tickets.c.ticket_price,
            tickets.c.booked_at,
            ticket_types.c.name,
            ticket_types.c.price,
        )
        .select_from(tickets.join(ticket_types, tickets.c.type_id == ticket_types.c.id))
        .where(tickets.c.id == ticket_row.id)
    )
    joined = session.execute(join_stmt).first()
    return _row_to_ticket_read(joined)


def search_tickets(
    session: Session,
    ticket_id: Optional[int] = None,
    name: Optional[str] = None,
    contact: Optional[str] = None,
    event: Optional[str] = None,
) -> List[TicketRead]:
    """Search tickets by optional criteria.

    * ``ticket_id`` – exact match on ticket id.
    * ``name`` – case‑insensitive partial match on ``customer_name`` (uses ILIKE).
    * ``contact`` – case‑insensitive partial match on ``contact_number``.
    * ``event`` – case‑insensitive partial match on ``event_name``.
    Returns a list of matching ``TicketRead`` objects.
    """
    stmt = (
        select(
            tickets.c.id,
            tickets.c.event_name,
            tickets.c.customer_name,
            tickets.c.contact_number,
            tickets.c.type_id,
            tickets.c.ticket_price,
            tickets.c.booked_at,
            ticket_types.c.name,
            ticket_types.c.price,
        )
        .select_from(tickets.join(ticket_types, tickets.c.type_id == ticket_types.c.id))
    )
    if ticket_id is not None:
        stmt = stmt.where(tickets.c.id == ticket_id)
    if name:
        stmt = stmt.where(tickets.c.customer_name.ilike(f"%{name}%"))
    if contact:
        stmt = stmt.where(tickets.c.contact_number.ilike(f"%{contact}%"))
    if event:
        stmt = stmt.where(tickets.c.event_name.ilike(f"%{event}%"))
    stmt = stmt.order_by(tickets.c.booked_at.desc())
    rows = session.execute(stmt).all()
    return [_row_to_ticket_read(r) for r in rows]


def get_user_tickets(session: Session, username: str) -> List[TicketRead]:
    """Retrieve all tickets booked by a specific user (matched case-insensitively)."""
    stmt = (
        select(
            tickets.c.id,
            tickets.c.event_name,
            tickets.c.customer_name,
            tickets.c.contact_number,
            tickets.c.type_id,
            tickets.c.ticket_price,
            tickets.c.booked_at,
            ticket_types.c.name,
            ticket_types.c.price,
        )
        .select_from(tickets.join(ticket_types, tickets.c.type_id == ticket_types.c.id))
        .where(tickets.c.customer_name.ilike(username))
        .order_by(tickets.c.booked_at.desc())
    )
    rows = session.execute(stmt).all()
    return [_row_to_ticket_read(r) for r in rows]


def get_ticket(session: Session, ticket_id: int) -> Optional[TicketRead]:
    """Fetch a single ticket by ``id``; returns ``None`` if not found."""
    stmt = (
        select(
            tickets.c.id,
            tickets.c.event_name,
            tickets.c.customer_name,
            tickets.c.contact_number,
            tickets.c.type_id,
            tickets.c.ticket_price,
            tickets.c.booked_at,
            ticket_types.c.name,
            ticket_types.c.price,
        )
        .select_from(tickets.join(ticket_types, tickets.c.type_id == ticket_types.c.id))
        .where(tickets.c.id == ticket_id)
    )
    row = session.execute(stmt).first()
    return _row_to_ticket_read(row) if row else None


def list_tickets(session: Session, skip: int = 0, limit: int = 100) -> List[TicketRead]:
    """Return a list of tickets, paginated with ``skip``/``limit``."""
    stmt = (
        select(
            tickets.c.id,
            tickets.c.event_name,
            tickets.c.customer_name,
            tickets.c.contact_number,
            tickets.c.type_id,
            tickets.c.ticket_price,
            tickets.c.booked_at,
            ticket_types.c.name,
            ticket_types.c.price,
        )
        .select_from(tickets.join(ticket_types, tickets.c.type_id == ticket_types.c.id))
        .offset(skip)
        .limit(limit)
    )
    rows = session.execute(stmt).all()
    return [_row_to_ticket_read(r) for r in rows]


def update_ticket(
    session: Session, ticket_id: int, payload: TicketCreate
) -> Optional[TicketRead]:
    """Replace mutable fields of a ticket."""
    price = _get_price_for_type(session, payload.type_id)
    values = {
        "customer_name": payload.customer_name,
        "contact_number": payload.contact_number,
        "type_id": payload.type_id,
        "ticket_price": price,
    }
    if payload.event_name:
        values["event_name"] = payload.event_name

    stmt = (
        update(tickets)
        .where(tickets.c.id == ticket_id)
        .values(**values)
        .returning(*tickets.c)
    )
    result = session.execute(stmt)
    session.commit()
    updated = result.first()
    if not updated:
        return None
    # Re‑fetch with the join to include the nested type
    join_stmt = (
        select(
            tickets.c.id,
            tickets.c.event_name,
            tickets.c.customer_name,
            tickets.c.contact_number,
            tickets.c.type_id,
            tickets.c.ticket_price,
            tickets.c.booked_at,
            ticket_types.c.name,
            ticket_types.c.price,
        )
        .select_from(tickets.join(ticket_types, tickets.c.type_id == ticket_types.c.id))
        .where(tickets.c.id == ticket_id)
    )
    joined = session.execute(join_stmt).first()
    return _row_to_ticket_read(joined)


def delete_ticket(session: Session, ticket_id: int) -> bool:
    """Delete a ticket. Returns ``True`` if a row was removed."""
    stmt = delete(tickets).where(tickets.c.id == ticket_id)
    result = session.execute(stmt)
    session.commit()
    return result.rowcount > 0

# ---------------------------------------------------------------------------
# Ticket‑type helpers (read‑only for this phase)
# ---------------------------------------------------------------------------

def list_ticket_types(session: Session) -> List[TicketTypeRead]:
    stmt = select(ticket_types.c.id, ticket_types.c.name, ticket_types.c.price)
    rows = session.execute(stmt).all()
    return [TicketTypeRead(id=row.id, name=row.name, price=row.price) for row in rows]

def get_ticket_type(session: Session, type_id: int) -> Optional[TicketTypeRead]:
    stmt = select(ticket_types.c.id, ticket_types.c.name, ticket_types.c.price).where(
        ticket_types.c.id == type_id
    )
    row = session.execute(stmt).first()
    if row:
        return TicketTypeRead(id=row.id, name=row.name, price=row.price)
    return None


