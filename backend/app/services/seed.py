from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.asset import Asset
from app.models.ticket import Ticket
from app.models.user import User


def seed_database(db: Session) -> None:
    try:
        admin = _get_or_create_user(db, "admin", "admin@infraopsportal.dev", "Admin@12345", "admin")
        operator = _get_or_create_user(db, "operator", "operator@infraopsportal.dev", "Operator@12345", "operator")

        assets = {
            "k8s-control-01": _get_or_create_asset(db, "k8s-control-01", "10.10.0.10", "server", "DC-1 Rack A1", "online"),
            "edge-router-01": _get_or_create_asset(db, "edge-router-01", "10.10.0.1", "router", "Network Room", "warning"),
            "access-switch-03": _get_or_create_asset(db, "access-switch-03", "10.10.2.3", "switch", "Floor 2", "online"),
            "billing-vm-01": _get_or_create_asset(db, "billing-vm-01", "10.10.5.21", "vm", "VMware Cluster", "maintenance"),
            "backup-node-01": _get_or_create_asset(db, "backup-node-01", "10.10.8.11", "server", "DC-2 Rack B4", "offline"),
        }

        _get_or_create_ticket(
            db,
            "Backup node unreachable",
            "Backup node is not responding to health checks.",
            "open",
            "critical",
            assets["backup-node-01"].id,
            admin.id,
        )
        _get_or_create_ticket(
            db,
            "Router packet drops",
            "Edge router shows intermittent packet drops during peak hours.",
            "in_progress",
            "high",
            assets["edge-router-01"].id,
            operator.id,
        )
        _get_or_create_ticket(
            db,
            "Patch billing VM",
            "Monthly OS patching for billing VM.",
            "open",
            "medium",
            assets["billing-vm-01"].id,
            operator.id,
        )
        db.commit()
    except IntegrityError:
        db.rollback()


def _get_or_create_user(db: Session, username: str, email: str, password: str, role: str) -> User:
    user = db.query(User).filter(User.username == username).first()
    if user:
        user.email = email
        user.role = role
        return user
    user = User(username=username, email=email, password_hash=hash_password(password), role=role)
    db.add(user)
    db.flush()
    return user


def _get_or_create_asset(db: Session, hostname: str, ip_address: str, asset_type: str, location: str, status: str) -> Asset:
    asset = db.query(Asset).filter(Asset.hostname == hostname).first()
    if asset:
        return asset
    asset = Asset(hostname=hostname, ip_address=ip_address, asset_type=asset_type, location=location, status=status)
    db.add(asset)
    db.flush()
    return asset


def _get_or_create_ticket(
    db: Session,
    title: str,
    description: str,
    status: str,
    severity: str,
    asset_id: int,
    created_by: int,
) -> Ticket:
    ticket = db.query(Ticket).filter(Ticket.title == title).first()
    if ticket:
        return ticket
    ticket = Ticket(
        title=title,
        description=description,
        status=status,
        severity=severity,
        asset_id=asset_id,
        created_by=created_by,
    )
    db.add(ticket)
    db.flush()
    return ticket
