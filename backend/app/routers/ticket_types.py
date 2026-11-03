"""Router for Ticket Types – read‑only list endpoint.

Only a ``GET /ticket-types`` is needed for now, because ticket types are static
lookup data (id, name, price).  The endpoint returns a list of ``TicketTypeRead``
objects defined in ``schemas.py``.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, schemas, dependencies

router = APIRouter(prefix="/ticket-types", tags=["ticket-types"])

@router.get("/", response_model=list[schemas.TicketTypeRead])
def list_ticket_types(
    db: Session = Depends(dependencies.get_db),
    current_user: dict = Depends(dependencies.require_staff),
):
    """Return all ticket‑type rows (id, name, price) – staff only."""
    return crud.list_ticket_types(db)

