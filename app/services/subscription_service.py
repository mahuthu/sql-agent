import stripe
from fastapi import HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.config import get_settings
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import SubscriptionCreate, SubscriptionUpdate
from datetime import datetime, timedelta

settings = get_settings()
stripe.api_key = settings.STRIPE_SECRET_KEY

class SubscriptionService:
    def __init__(self, db: Session):
        self.db = db

    async def get_current_subscription(self, user_id: int) -> Subscription:
        # First, verify the user exists
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Then get their subscription
        subscription = self.db.query(Subscription).filter(
            Subscription.user_id == user_id
        ).first()
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active subscription found"
            )
        return subscription

    async def get_usage(self, user_id: int):
        subscription = await self.get_current_subscription(user_id)
        return {
            "total_queries": subscription.credits_used,
            "queries_remaining": subscription.credits_remaining,
            "plan_limit": self._get_plan_limit(subscription.plan_id),
            "reset_date": subscription.expires_at
        }

    async def create_subscription(self, user_id: int, subscription_data: SubscriptionCreate):
        # Check if user already has a subscription
        existing = self.db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.status == "active"
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has an active subscription"
            )

        # Create subscription
        subscription = Subscription(
            user_id=user_id,
            plan_id=subscription_data.plan_id,
            status="active",
            credits_remaining=self._get_plan_limit(subscription_data.plan_id),
            expires_at=datetime.utcnow() + timedelta(days=30)
        )
        
        self.db.add(subscription)
        self.db.commit()
        self.db.refresh(subscription)
        
        return subscription

    async def create_checkout_session(self, user_id: int, price_id: str):
        user = self.db.query(User).filter(User.id == user_id).first()
        
        # Create or get Stripe customer
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                metadata={"user_id": user_id}
            )
            user.stripe_customer_id = customer.id
            self.db.commit()

        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=user.stripe_customer_id,
            payment_method_types=['card'],
            mode='subscription',
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            success_url=f"{settings.FRONTEND_URL}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/pricing",
            metadata={"user_id": user_id}
        )
        
        return session

    async def create_portal_session(self, user_id: int):
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user.stripe_customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No Stripe customer found"
            )

        session = stripe.billing_portal.Session.create(
            customer=user.stripe_customer_id,
            return_url=f"{settings.FRONTEND_URL}/dashboard",
        )
        return session

    async def handle_webhook(self, payload: bytes, signature: str):
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception as e:
            print(f"Error constructing webhook event: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

        print(f"Received webhook event type: {event.type}")  # Debug log

        try:
            if event.type == "customer.subscription.created":
                await self.handle_subscription_created(event.data.object)
            elif event.type == "customer.subscription.updated":
                await self.handle_subscription_updated(event.data.object)
            elif event.type == "customer.subscription.deleted":
                await self.handle_subscription_deleted(event.data.object)
            else:
                print(f"Unhandled event type: {event.type}")
            
            return {"status": "success"}
        except Exception as e:
            print(f"Error handling webhook event: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Error processing webhook: {str(e)}"
            )

    def _get_plan_limit(self, plan_id: str) -> int:
        plan_limits = {
            "basic": 1000,
            "pro": 5000,
            "enterprise": 20000
        }
        return plan_limits.get(plan_id, 0)

    async def check_status(self, user_id: int):
        subscription = await self.get_current_subscription(user_id)
        return {
            "status": subscription.status,
            "credits_remaining": subscription.credits_remaining,
            "expires_at": subscription.expires_at
        }

    async def refresh_credits(self, user_id: int):
        subscription = await self.get_current_subscription(user_id)
        if subscription.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subscription is not active"
            )
        
        subscription.credits_remaining = self._get_plan_limit(subscription.plan_id)
        subscription.credits_used = 0
        subscription.expires_at = datetime.utcnow() + timedelta(days=30)
        
        self.db.commit()
        self.db.refresh(subscription)
        
        return subscription