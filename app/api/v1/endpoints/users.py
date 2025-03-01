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
    try:
        if current_user.credits_remaining is None or current_user.credits_remaining == 0:
            current_user.credits_remaining = 20
            current_user.subscription_status = "free"
            db.commit()
            db.refresh(current_user)
        
        # Convert the database model to response schema
        credits_response = UserResponse.model_validate(current_user)
        
        return StandardResponse(
            status="success",
            message="Credits updated successfully",
            data=credits_response
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update credits: {str(e)}"
        ) 