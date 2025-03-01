from fastapi import APIRouter
from app.api.v1.endpoints import auth, templates, queries
from app.api.v1.endpoints.subscriptions import router as subscriptions_router

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(queries.router, prefix="/queries", tags=["queries"])
api_router.include_router(subscriptions_router, prefix="/subscriptions", tags=["subscriptions"])

# Export the router
__all__ = ["api_router"]
