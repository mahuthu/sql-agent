from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, templates, queries
from app.config import get_settings
from app.database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

settings = get_settings()
# app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)
app = FastAPI(
    title="SQL Agent API",
    description="AI-powered SQL query assistant",
    version="1.0.0"
)
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["auth"]
)
app.include_router(
    templates.router,
    prefix=f"{settings.API_V1_STR}/templates",
    tags=["templates"]
)

app.include_router(
    queries.router,
    prefix=f"{settings.API_V1_STR}/queries",
    tags=["queries"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)