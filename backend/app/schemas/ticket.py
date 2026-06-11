from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.asset import AssetRead
from app.schemas.user import UserRead


TicketStatus = Literal["open", "in_progress", "closed"]
TicketSeverity = Literal["low", "medium", "high", "critical"]


class TicketBase(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    description: str = Field(min_length=5)
    status: TicketStatus = "open"
    severity: TicketSeverity = "medium"
    asset_id: int | None = None


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=160)
    description: str | None = Field(default=None, min_length=5)
    status: TicketStatus | None = None
    severity: TicketSeverity | None = None
    asset_id: int | None = None


class TicketRead(TicketBase):
    id: int
    created_by: int
    created_at: datetime
    asset: AssetRead | None = None
    creator: UserRead | None = None

    class Config:
        from_attributes = True
