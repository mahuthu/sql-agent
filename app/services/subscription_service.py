import stripe
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from app.config import get_settings
from app.models.subscription import Subscription, SubscriptionUsage
from app.schemas.subscription import SubscriptionCreate, SubscriptionUpdate
from datetime import datetime
from ..models.user import User


settings = get_settings()
stripe.api_key = settings.STRIPE_SECRET_KEY
# stripe.api_key = settings.STRIPE_SECRET_KEY

class SubscriptionService:
    def __init__(self, db: Session):
        self.db = db

    async def create_customer(self, user):
        customer = stripe.Customer.create(
            email=user.email,
            metadata={"user_id": user.id}
        )
        return customer

    async def create_checkout_session(self, user_id: int, price_id: str):
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get or create Stripe customer
        if not user.stripe_customer_id:
            customer = await self.create_customer(user)
            user.stripe_customer_id = customer.id
            self.db.commit()

        try:
            session = stripe.checkout.Session.create(
                customer=user.stripe_customer_id,
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=f'{settings.FRONTEND_URL}/subscription/success',
                cancel_url=f'{settings.FRONTEND_URL}/subscription/cancel',
            )
            return session

        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def create_portal_session(self, user_id: int):
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.stripe_customer_id:
            raise HTTPException(status_code=404, detail="User not found")

        try:
            session = stripe.billing_portal.Session.create(
                customer=user.stripe_customer_id,
                return_url=f'{settings.FRONTEND_URL}/subscription',
            )
            return session

        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def handle_webhook(self, payload, sig_header):
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            raise HTTPException(status_code=400, detail="Invalid signature")

        if event.type == 'customer.subscription.updated':
            await self.handle_subscription_updated(event.data.object)
        elif event.type == 'customer.subscription.deleted':
            await self.handle_subscription_deleted(event.data.object)

    async def handle_subscription_updated(self, subscription_data):
        subscription = self.db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_data.id
        ).first()

        if subscription:
            subscription.status = subscription_data.status
            subscription.current_period_end = datetime.fromtimestamp(
                subscription_data.current_period_end
            )
            subscription.cancel_at_period_end = subscription_data.cancel_at_period_end
            self.db.commit()

    async def handle_subscription_deleted(self, subscription_data):
        subscription = self.db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_data.id
        ).first()

        if subscription:
            subscription.status = 'canceled'
            self.db.commit() 