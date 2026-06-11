from pydantic import BaseModel


class Summary(BaseModel):
    total_assets: int
    online_assets: int
    warning_assets: int
    offline_assets: int
    open_tickets: int
    in_progress_tickets: int
    closed_tickets: int
    critical_tickets: int
