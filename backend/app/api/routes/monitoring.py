from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.asset import Asset
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.monitoring import Summary

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


@router.get("/summary", response_model=Summary)
def summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return Summary(
        total_assets=db.query(Asset).count(),
        online_assets=db.query(Asset).filter(Asset.status == "online").count(),
        warning_assets=db.query(Asset).filter(Asset.status == "warning").count(),
        offline_assets=db.query(Asset).filter(Asset.status == "offline").count(),
        open_tickets=db.query(Ticket).filter(Ticket.status == "open").count(),
        in_progress_tickets=db.query(Ticket).filter(Ticket.status == "in_progress").count(),
        closed_tickets=db.query(Ticket).filter(Ticket.status == "closed").count(),
        critical_tickets=db.query(Ticket).filter(Ticket.severity == "critical").count(),
    )


@router.get("/metrics", include_in_schema=False)
def metrics(db: Session = Depends(get_db)):
    values = {
        "infraops_assets_total": db.query(Asset).count(),
        "infraops_assets_offline": db.query(Asset).filter(Asset.status == "offline").count(),
        "infraops_tickets_open": db.query(Ticket).filter(Ticket.status == "open").count(),
        "infraops_tickets_critical": db.query(Ticket).filter(Ticket.severity == "critical").count(),
    }
    body = "\n".join(f"# TYPE {key} gauge\n{key} {value}" for key, value in values.items()) + "\n"
    return Response(content=body, media_type="text/plain; version=0.0.4")
