from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


AssetType = Literal["server", "router", "switch", "vm", "cluster", "firewall"]
AssetStatus = Literal["online", "warning", "offline", "maintenance"]


class AssetBase(BaseModel):
    hostname: str = Field(min_length=2, max_length=120)
    ip_address: str = Field(min_length=3, max_length=45)
    asset_type: AssetType
    location: str = Field(min_length=2, max_length=120)
    status: AssetStatus = "online"


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    hostname: str | None = Field(default=None, min_length=2, max_length=120)
    ip_address: str | None = Field(default=None, min_length=3, max_length=45)
    asset_type: AssetType | None = None
    location: str | None = Field(default=None, min_length=2, max_length=120)
    status: AssetStatus | None = None


class AssetRead(AssetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
