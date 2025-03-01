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
from app.models.subscription import Subscription
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.response import StandardResponse
from app.dependencies import get_current_user_by_api_key
from datetime import timedelta
from app.config import get_settings
import logging
from typing import Optional
from app.services.email_service import send_welcome_email, send_password_reset_email
from app.schemas.token import Token
import secrets

settings = get_settings()
router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    db_user = User(
        email=user.email,
        hashed_password=get_password_hash(user.password),
        api_key=secrets.token_urlsafe(32)
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create default subscription
        subscription = Subscription(
            user_id=db_user.id,
            status="free"
        )
        db.add(subscription)
        db.commit()
        
        return {"message": "User registered successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login endpoint"""
    try:
        # Debug print
        print(f"Login attempt for email: {form_data.username}")
        
        user = db.query(User).filter(User.email == form_data.username).first()
        
        if not user:
            print("User not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        if not verify_password(form_data.password, user.hashed_password):
            print("Invalid password")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email
            }
        }
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise

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
    return {
        "status": "success",
        "message": "If the email exists, a password reset link will be sent"
    }

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
        
        return {
            "status": "success",
            "message": "Password reset successfully"
        }
    except Exception as e:
        logger.error(f"Password reset error: {e}")
        raise HTTPException(status_code=400, detail="Invalid or expired token")

@router.post("/refresh-api-key", response_model=StandardResponse)
async def refresh_api_key(
    current_user: User = Depends(get_current_user_by_api_key),
    db: Session = Depends(get_db)
):
    try:
        # Generate a new API key
        new_api_key = generate_api_key()
        
        # Update the user's API key
        current_user.api_key = new_api_key
        db.commit()
        
        return StandardResponse(
            status="success",
            message="API key refreshed successfully",
            data={"api_key": new_api_key}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refresh API key: {str(e)}"
        )

def generate_api_key() -> str:
    """Generate a secure API key"""
    import secrets
    return f"sk_{secrets.token_urlsafe(32)}"

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user