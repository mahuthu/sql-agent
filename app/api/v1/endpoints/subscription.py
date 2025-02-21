# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app.database import get_db
# from app.dependencies import get_current_user_by_api_key
# from app.models.user import User
# from app.schemas.response import StandardResponse
# from app.config import get_settings
# import stripe

# router = APIRouter()
# settings = get_settings()
# stripe.api_key = settings.STRIPE_SECRET_KEY

# @router.post("/create-checkout-session")
# async def create_checkout_session(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user_by_api_key)
# ):
#     try:
#         checkout_session = stripe.checkout.Session.create(
#             customer_email=current_user.email,
#             line_items=[
#                 {
#                     'price': settings.STRIPE_PRICE_ID,
#                     'quantity': 1,
#                 },
#             ],
#             mode='subscription',
#             success_url='http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
#             cancel_url='http://localhost:3000/cancel',
#         )
#         return {"url": checkout_session.url}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.post("/webhook")
# async def webhook_received(
#     request: Request,
#     db: Session = Depends(get_db)
# ):
#     webhook_secret = settings.STRIPE_WEBHOOK_SECRET
#     signature = request.headers.get("stripe-signature")
    
#     try:
#         event = stripe.Webhook.construct_event(
#             payload=await request.body(),
#             sig_header=signature,
#             secret=webhook_secret
#         )
        
#         # Handle the event
#         if event.type == "checkout.session.completed":
#             session = event.data.object
#             # Update user subscription status and credits
#             user = db.query(User).filter(User.email == session.customer_email).first()
#             if user:
#                 user.subscription_status = "premium"
#                 user.credits_remaining += 100  # Add premium credits
#                 db.commit()
                
#         return {"status": "success"}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e)) 