from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, require_operator
from app.core.database import get_db
from app.models.asset import Asset
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketRead, TicketUpdate

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("", response_model=list[TicketRead])
def list_tickets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Ticket)
        .options(joinedload(Ticket.asset), joinedload(Ticket.creator))
        .order_by(Ticket.created_at.desc())
        .all()
    )


@router.post("", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.asset_id and not db.get(Asset, payload.asset_id):
        raise HTTPException(status_code=404, detail="Asset not found")
    ticket = Ticket(**payload.model_dump(), created_by=current_user.id)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return (
        db.query(Ticket)
        .options(joinedload(Ticket.asset), joinedload(Ticket.creator))
        .filter(Ticket.id == ticket.id)
        .one()
    )


@router.put("/{ticket_id}", response_model=TicketRead)
def update_ticket(ticket_id: int, payload: TicketUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_operator)):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if payload.asset_id and not db.get(Asset, payload.asset_id):
        raise HTTPException(status_code=404, detail="Asset not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(ticket, key, value)
    db.commit()
    return (
        db.query(Ticket)
        .options(joinedload(Ticket.asset), joinedload(Ticket.creator))
        .filter(Ticket.id == ticket_id)
        .one()
    )


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_operator)):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(ticket)
    db.commit()
