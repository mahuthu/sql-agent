from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class SubscriptionBase(BaseModel):
    plan_id: str
    status: str
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool

class SubscriptionCreate(SubscriptionBase):
    stripe_customer_id: str
    stripe_subscription_id: str
    user_id: int

class SubscriptionUpdate(BaseModel):
    status: Optional[str] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: Optional[bool] = None

class SubscriptionOut(SubscriptionBase):
    id: int
    stripe_customer_id: str
    stripe_subscription_id: str
    created_at: datetime

    class Config:
        orm_mode = True

class SubscriptionPlan(BaseModel):
    id: str
    name: str
    description: str
    price: float
    features: List[str]
    stripe_price_id: str 