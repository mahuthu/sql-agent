from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.templates import router as templates_router
from app.api.v1.endpoints.queries import router as queries_router

__all__ = ["auth_router", "templates_router", "queries_router"]
