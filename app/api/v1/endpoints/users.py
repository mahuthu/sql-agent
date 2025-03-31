from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.response import StandardResponse
from app.schemas.user import UserResponse
from app.dependencies import get_current_user_by_api_key

from app.models.user import User
from app.database import get_db

router = APIRouter()

@router.get("/fix-credits", response_model=StandardResponse[UserResponse])
async def fix_user_credits(
    current_user: User = Depends(get_current_user_by_api_key),
    db: Session = Depends(get_db)
):
    """
    Reset user credits using the default values from the User model
    if they have no credits.
    """
    try:
        # Get fresh user data from database
        user = db.query(User).filter(User.id == current_user.id).first()
        
        if user.credits_remaining is None or user.credits_remaining == 0:
            db.refresh(user)  # This will apply the model's default values
            db.commit()
            message = "Credits reset to default value"
        else:
            message = "User already has credits"
        
        credits_response = UserResponse.model_validate(user)
        
        return StandardResponse(
            status="success",
            message=message,
            data=credits_response
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update credits: {str(e)}"
        ) 