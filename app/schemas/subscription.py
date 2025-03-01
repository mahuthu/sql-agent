from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class SubscriptionBase(BaseModel):
    plan_id: Optional[str] = None
    status: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: Optional[bool] = False

class SubscriptionCreate(SubscriptionBase):
    user_id: int

class SubscriptionUpdate(SubscriptionBase):
    pass

class SubscriptionOut(SubscriptionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    expires_at: datetime = None

    class Config:
        from_attributes = True

class SubscriptionPlan(BaseModel):
    id: str
    name: str
    description: str
    price: float
    features: List[str]
    stripe_price_id: str

class SubscriptionUsage(BaseModel):
    total_queries: int
    queries_remaining: int
    plan_limit: int
    reset_date: datetime

class CreateCheckoutSessionResponse(BaseModel):
    sessionUrl: str 

class CheckoutSessionRequest(BaseModel):
    price_id: str
