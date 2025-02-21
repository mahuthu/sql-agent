from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.security import (
    verify_password, 
    create_access_token, 
    get_password_hash,
    generate_api_key,
    verify_token
)
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.response import StandardResponse
from app.dependencies import get_current_user_by_api_key
from datetime import timedelta
from app.config import get_settings
import logging
from typing import Optional
from app.services.email_service import send_welcome_email, send_password_reset_email

settings = get_settings()
router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", response_model=StandardResponse)
async def register_user(
    user: UserCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # Check if user exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    try:
        # Create new user
        hashed_password = get_password_hash(user.password)
        api_key = generate_api_key()
        
        db_user = User(
            email=user.email,
            hashed_password=hashed_password,
            api_key=api_key
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Send welcome email in background
        background_tasks.add_task(
            send_welcome_email,
            email=user.email
        )
        
        return StandardResponse(
            status="success",
            message="User registered successfully",
            data=UserResponse.from_orm(db_user)
        )
    except Exception as e:
        logger.error(f"Registration error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error creating user"
        )

@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login to get access token"""
    # Authenticate user
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "api_key": user.api_key
    }

@router.post("/reset-password")
async def request_password_reset(
    email: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Request password reset"""
    user = db.query(User).filter(User.email == email).first()
    if user:
        # Generate reset token
        reset_token = create_access_token(
            data={"sub": str(user.id), "type": "reset"},
            expires_delta=timedelta(hours=1)
        )
        
        # Send reset email in background
        background_tasks.add_task(
            send_password_reset_email,
            email=email,
            token=reset_token
        )
    
    # Always return success to prevent email enumeration
    return StandardResponse(
        status="success",
        message="If the email exists, a password reset link will be sent"
    )

@router.post("/reset-password/{token}")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    """Reset password using token"""
    try:
        # Verify token
        payload = verify_token(token)
        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid token type")
        
        # Update password
        user = db.query(User).filter(User.id == payload["sub"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.hashed_password = get_password_hash(new_password)
        db.commit()
        
        return StandardResponse(
            status="success",
            message="Password reset successfully"
        )
    except Exception as e:
        logger.error(f"Password reset error: {e}")
        raise HTTPException(status_code=400, detail="Invalid or expired token")

@router.post("/refresh-api-key")
async def refresh_api_key(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_by_api_key)
):
    """Generate new API key"""
    try:
        new_api_key = generate_api_key()
        current_user.api_key = new_api_key
        db.commit()
        
        return StandardResponse(
            status="success",
            message="API key refreshed successfully",
            data={"api_key": new_api_key}
        )
    except Exception as e:
        logger.error(f"API key refresh error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error refreshing API key"
        )

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user