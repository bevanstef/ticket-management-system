"""Router for Ticket CRUD operations (functional, no auth yet).

Endpoints:
* ``POST /tickets`` – create a ticket (price derived from ticket type).
* ``GET /tickets/{ticket_id}`` – fetch a single ticket.
* ``GET /tickets`` – list tickets (pagination via ``skip``/``limit``).
* ``GET /tickets/search`` – search tickets by optional ``id``, ``name`` or ``contact``.
* ``PUT /tickets/{ticket_id}`` – update mutable fields (price recomputed).
* ``DELETE /tickets/{ticket_id}`` – remove a ticket.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from .. import crud, schemas, dependencies

router = APIRouter(prefix="/tickets", tags=["tickets"])

# ---------- CREATE ----------
@router.post("/", response_model=schemas.TicketRead, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: schemas.TicketCreate,
    db: Session = Depends(dependencies.get_db),
):
    """Create a ticket – the price is looked up from ``ticket_types``."""
    return crud.create_ticket(db, payload)

# ---------- SEARCH ----------
@router.get("/search", response_model=list[schemas.TicketRead])
def search_tickets(
    ticket_id: Optional[int] = Query(None, description="Exact ticket ID"),
    name: Optional[str] = Query(None, description="Customer name (case‑insensitive)"),
    contact: Optional[str] = Query(None, description="Contact number (case‑insensitive)"),
    db: Session = Depends(dependencies.get_db),
):
    """Search tickets by optional criteria.
    All parameters are optional; combine them to filter results.
    """
    return crud.search_tickets(db, ticket_id=ticket_id, name=name, contact=contact)

# ---------- READ ONE ----------
@router.get("/{ticket_id}", response_model=schemas.TicketRead)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(dependencies.get_db),
):
    ticket = crud.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

# ---------- LIST ----------
@router.get("/", response_model=list[schemas.TicketRead])
def list_tickets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(dependencies.get_db),
):
    """Return a slice of tickets – useful for UI tables."""
    return crud.list_tickets(db, skip=skip, limit=limit)

# ---------- UPDATE ----------
@router.put("/{ticket_id}", response_model=schemas.TicketRead)
def update_ticket(
    ticket_id: int,
    payload: schemas.TicketCreate,
    db: Session = Depends(dependencies.get_db),
):
    ticket = crud.update_ticket(db, ticket_id, payload)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

# ---------- DELETE ----------
@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(dependencies.get_db),
):
    deleted = crud.delete_ticket(db, ticket_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return None
