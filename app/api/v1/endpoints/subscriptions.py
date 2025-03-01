from fastapi import APIRouter, Depends, Header, Request, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_current_user_by_api_key
from app.services.subscription_service import SubscriptionService
from app.schemas.subscription import (
    SubscriptionPlan, 
    SubscriptionOut, 
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionUsage,
    CreateCheckoutSessionResponse,
    CheckoutSessionRequest


)
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.response import StandardResponse
from fastapi import Body



router = APIRouter()

@router.get("/plans", response_model=StandardResponse)
async def get_subscription_plans():
    """Get available subscription plans"""
    plans = [
        {
            "id": "basic",
            "name": "Basic Plan",
            "description": "Perfect for small projects",
            "price": 9.99,
            "features": [
                "1,000 queries per month",
                "Basic support",
                "Standard response time"
            ],
            "stripe_price_id": "price_1QvaROQuBESwkhrprjg5VAxa"  # Your Stripe price ID for Basic plan
        },
        {
            "id": "pro",
            "name": "Pro Plan",
            "description": "For growing businesses",
            "price": 29.99,
            "features": [
                "5,000 queries per month",
                "Priority support",
                "Faster response time",
                "Advanced analytics"
            ],
            "stripe_price_id": "price_1QvaUEQuBESwkhrpRMTbzG84"  # Your Stripe price ID for Pro plan
        },
        {
            "id": "enterprise",
            "name": "Enterprise Plan",
            "description": "For large organizations",
            "price": 99.99,
            "features": [
                "20,000 queries per month",
                "24/7 support",
                "Fastest response time",
                "Custom features",
                "Dedicated account manager"
            ],
            "stripe_price_id": "price_1QvaVfQuBESwkhrpVHPv6m0F"  # Your Stripe price ID for Enterprise plan
        }
    ]
    
    return StandardResponse(
        status="success",
        message="Subscription plans retrieved",
        data=plans
    )

@router.get("/current", response_model=SubscriptionOut)
async def get_current_subscription(
    current_user: User = Depends(get_current_user_by_api_key),
    db: Session = Depends(get_db)
):
    """Get current user's subscription"""
    subscription_service = SubscriptionService(db)
    return await subscription_service.get_current_subscription(current_user.id)

@router.get("/usage", response_model=SubscriptionUsage)
async def get_subscription_usage(
    current_user: User = Depends(get_current_user_by_api_key),
    db: Session = Depends(get_db)
):
    """Get current subscription usage"""
    subscription_service = SubscriptionService(db)
    return await subscription_service.get_usage(current_user.id)

@router.post("/subscribe", response_model=SubscriptionOut)
async def create_subscription(
    subscription: SubscriptionCreate,
    current_user: User = Depends(get_current_user_by_api_key),
    db: Session = Depends(get_db)
):
    """Create a new subscription"""
    subscription_service = SubscriptionService(db)
    return await subscription_service.create_subscription(current_user.id, subscription)

@router.put("/update", response_model=SubscriptionOut)
async def update_subscription(
    subscription: SubscriptionUpdate,
    current_user: User = Depends(get_current_user_by_api_key),
    db: Session = Depends(get_db)
):
    """Update existing subscription"""
    subscription_service = SubscriptionService(db)
    return await subscription_service.update_subscription(current_user.id, subscription)

@router.delete("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user_by_api_key),
    db: Session = Depends(get_db)
):
    """Cancel current subscription"""
    subscription_service = SubscriptionService(db)
    await subscription_service.cancel_subscription(current_user.id)
    return {"message": "Subscription cancelled successfully"}

# @router.post("/create-checkout-session")
# async def create_checkout_session(
#     price_id: str,
#     current_user: User = Depends(get_current_user_by_api_key),
#     db: Session = Depends(get_db)
# ):
#     """Create Stripe checkout session"""
#     subscription_service = SubscriptionService(db)
#     session = await subscription_service.create_checkout_session(
#         current_user.id, 
#         price_id
#     )
#     return {"sessionUrl": session.url}

@router.post("/create-checkout-session", response_model=StandardResponse[CreateCheckoutSessionResponse])
async def create_checkout_session(
    request: CheckoutSessionRequest,
    current_user: User = Depends(get_current_user_by_api_key),
    db: Session = Depends(get_db)
):
    """Create Stripe checkout session"""
    subscription_service = SubscriptionService(db)
    try:

        session = await subscription_service.create_checkout_session(
            current_user.id, 
            request.price_id
        )

        template_response = CreateCheckoutSessionResponse.model_validate(session)


        # return {"sessionUrl": session.url}
        return StandardResponse(
                status="success",
                message="Subscription created successfully",
                data=template_response
            )
    except Exception as e:
        print(f"Error creating subscription: {str(e)}")  # Add logging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )



@router.post("/create-portal-session")
async def create_portal_session(
    current_user: User = Depends(get_current_user_by_api_key),
    db: Session = Depends(get_db)
):
    """Create Stripe customer portal session"""
    subscription_service = SubscriptionService(db)
    session = await subscription_service.create_portal_session(current_user.id)
    return {"portalUrl": session.url}

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    # Get the webhook signature from headers
    signature = request.headers.get("stripe-signature")
    
    if not signature:
        raise HTTPException(
            status_code=400,
            detail="Missing stripe-signature header"
        )
    
    # Get the raw payload
    payload = await request.body()
    
    # Process the webhook
    subscription_service = SubscriptionService(db)
    await subscription_service.handle_webhook(payload,signature)
    return {"status": "success"}

@router.get("/check-status")
async def check_subscription_status(
    current_user: User = Depends(get_current_user_by_api_key),
    db: Session = Depends(get_db)
):
    """Check subscription status and credits"""
    subscription_service = SubscriptionService(db)
    return await subscription_service.check_status(current_user.id)

@router.post("/refresh-credits")
async def refresh_subscription_credits(
    current_user: User = Depends(get_current_user_by_api_key),
    db: Session = Depends(get_db)
):
    """Manually refresh subscription credits"""
    subscription_service = SubscriptionService(db)
    return await subscription_service.refresh_credits(current_user.id) 