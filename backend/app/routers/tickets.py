"""Router for Ticket CRUD operations with Role-Based Access Control (RBAC).

Permissions:
* Authenticated users (customer & staff):
  - ``POST /tickets`` – create a ticket (price derived from ticket type).
* Staff only:
  - ``GET /tickets/search`` – search tickets by optional criteria.
  - ``GET /tickets/{ticket_id}`` – fetch a single ticket.
  - ``GET /tickets`` – list tickets (pagination via ``skip``/``limit``).
  - ``PUT /tickets/{ticket_id}`` – update mutable fields (price recomputed).
  - ``DELETE /tickets/{ticket_id}`` – remove a ticket.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from .. import crud, schemas, dependencies

router = APIRouter(prefix="/tickets", tags=["tickets"])

# ---------- CREATE (customer & staff) ----------
@router.post("/", response_model=schemas.TicketRead, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: schemas.TicketCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: dict = Depends(dependencies.get_current_user),
):
    """Create a ticket – accessible to all authenticated users."""
    return crud.create_ticket(db, payload)

# ---------- MY TICKETS (customer & staff) ----------
@router.get("/my-tickets", response_model=list[schemas.TicketRead])
def get_my_tickets(
    db: Session = Depends(dependencies.get_db),
    current_user: dict = Depends(dependencies.get_current_user),
):
    """Retrieve all tickets belonging to the authenticated user."""
    username = current_user.get("username", "")
    return crud.get_user_tickets(db, username=username)

# ---------- SEARCH (staff only) ----------
@router.get("/search", response_model=list[schemas.TicketRead])
def search_tickets(
    ticket_id: Optional[int] = Query(None, description="Exact ticket ID"),
    name: Optional[str] = Query(None, description="Customer name (case‑insensitive)"),
    contact: Optional[str] = Query(None, description="Contact number (case‑insensitive)"),
    event: Optional[str] = Query(None, description="Event name (case‑insensitive)"),
    db: Session = Depends(dependencies.get_db),
    current_user: dict = Depends(dependencies.require_staff),
):
    """Search tickets by optional criteria – staff only."""
    return crud.search_tickets(db, ticket_id=ticket_id, name=name, contact=contact, event=event)

# ---------- READ ONE (staff only) ----------
@router.get("/{ticket_id}", response_model=schemas.TicketRead)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: dict = Depends(dependencies.require_staff),
):
    """Fetch a single ticket – staff only."""
    ticket = crud.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

# ---------- LIST (staff only) ----------
@router.get("/", response_model=list[schemas.TicketRead])
def list_tickets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(dependencies.get_db),
    current_user: dict = Depends(dependencies.require_staff),
):
    """Return a slice of tickets – staff only."""
    return crud.list_tickets(db, skip=skip, limit=limit)

# ---------- UPDATE (staff only) ----------
@router.put("/{ticket_id}", response_model=schemas.TicketRead)
def update_ticket(
    ticket_id: int,
    payload: schemas.TicketCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: dict = Depends(dependencies.require_staff),
):
    """Update a ticket – staff only."""
    ticket = crud.update_ticket(db, ticket_id, payload)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

# ---------- DELETE (staff only) ----------
@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: dict = Depends(dependencies.require_staff),
):
    """Delete a ticket – staff only."""
    deleted = crud.delete_ticket(db, ticket_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return None
