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
        customer_name,
        contact_number,
        status,
        created_at,
        updated_at,
        type_id,
        ticket_price,
        booked_at,
        type_name,
        type_price,
    ) = row
    ticket_type = TicketTypeRead(id=type_id, name=type_name, price=type_price)
    return TicketRead(
        id=id,
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
    stmt = insert(tickets).values(
        customer_name=payload.customer_name,
        contact_number=payload.contact_number,
        type_id=payload.type_id,
        ticket_price=price,
        # ``booked_at`` will be filled by the DB default (now()) if omitted
    ).returning(*tickets.c)
    result: Result = session.execute(stmt)
    session.commit()
    ticket_row = result.first()
    # Join with ticket_types to include the nested ``type`` field
    join_stmt = (
        select(
            tickets.c.id,
            tickets.c.customer_name,
            tickets.c.contact_number,
            tickets.c.status,
            tickets.c.created_at,
            tickets.c.updated_at,
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


def get_ticket(session: Session, ticket_id: int) -> Optional[TicketRead]:
    """Fetch a single ticket by ``id``; returns ``None`` if not found."""
    stmt = (
        select(
            tickets.c.id,
            tickets.c.customer_name,
            tickets.c.contact_number,
            tickets.c.status,
            tickets.c.created_at,
            tickets.c.updated_at,
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
            tickets.c.customer_name,
            tickets.c.contact_number,
            tickets.c.status,
            tickets.c.created_at,
            tickets.c.updated_at,
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
    """Replace mutable fields of a ticket.

    The price is *not* accepted from the client – it is recomputed from the
    (potentially new) ``type_id``.
    """
    price = _get_price_for_type(session, payload.type_id)
    stmt = (
        update(tickets)
        .where(tickets.c.id == ticket_id)
        .values(
            customer_name=payload.customer_name,
            contact_number=payload.contact_number,
            type_id=payload.type_id,
            ticket_price=price,
            # ``updated_at`` will be refreshed by the DB trigger/default
        )
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
            tickets.c.customer_name,
            tickets.c.contact_number,
            tickets.c.status,
            tickets.c.created_at,
            tickets.c.updated_at,
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


