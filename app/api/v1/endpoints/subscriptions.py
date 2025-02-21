from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.services.subscription_service import SubscriptionService
from app.schemas.subscription import SubscriptionPlan, SubscriptionOut
from typing import List
from app.database import get_db


router = APIRouter()

@router.get("/plans", response_model=List[SubscriptionPlan])
async def get_subscription_plans():
    return [
        {
            "id": "basic",
            "name": "Basic",
            "description": "For individual users",
            "price": 9.99,
            "features": ["1000 queries/month", "Basic support", "Standard templates"],
            "stripe_price_id": "price_H5ggYwtDq4fbrJ"
        },
        {
            "id": "pro",
            "name": "Professional",
            "description": "For power users",
            "price": 29.99,
            "features": ["5000 queries/month", "Priority support", "Advanced templates"],
            "stripe_price_id": "price_H5ggYwtDq4fbrK"
        }
    ]

@router.get("/current", response_model=SubscriptionOut)
async def get_current_subscription(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subscription_service = SubscriptionService(db)
    return await subscription_service.get_current_subscription(current_user.id)

@router.post("/create-checkout-session")
async def create_checkout_session(
    price_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subscription_service = SubscriptionService(db)
    session = await subscription_service.create_checkout_session(
        current_user.id, 
        price_id
    )
    return {"sessionUrl": session.url}

@router.post("/create-portal-session")
async def create_portal_session(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subscription_service = SubscriptionService(db)
    session = await subscription_service.create_portal_session(current_user.id)
    return {"portalUrl": session.url}

@router.post("/webhook")
async def handle_stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    payload = await request.body()
    subscription_service = SubscriptionService(db)
    await subscription_service.handle_webhook(payload, stripe_signature)
    return {"status": "success"} 