from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user_by_api_key
from app.models.user import User
from app.schemas.template import TemplateCreate, TemplateResponse, TemplateUpdate
from app.schemas.response import StandardResponse
from app.services.template_service import TemplateService
from typing import List

router = APIRouter()

# Dependency to get template service
def get_template_service(db: Session = Depends(get_db)) -> TemplateService:
    return TemplateService(db)

@router.post("/", response_model=StandardResponse[TemplateResponse])
def create_template(
    template: TemplateCreate,
    template_service: TemplateService = Depends(get_template_service),
    current_user: User = Depends(get_current_user_by_api_key)
):
    try:
        db_template = template_service.create_template(template, current_user.id)
        
        # Convert the database model to response schema
        template_response = TemplateResponse.model_validate(db_template)
        
        return StandardResponse(
            status="success",
            message="Template created successfully",
            data=template_response
        )
    except Exception as e:
        print(f"Error creating template: {str(e)}")  # Add logging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/", response_model=StandardResponse[List[TemplateResponse]])
def list_templates(
    template_service: TemplateService = Depends(get_template_service),
    current_user: User = Depends(get_current_user_by_api_key)
):
    templates = template_service.get_templates(current_user.id)

    template_list = [
        TemplateResponse.model_validate(template) 
        for template in templates
    ]
    
    return StandardResponse(
        status="success",
        message="Templates retrieved successfully",
        data=template_list
    )

@router.get("/{template_id}", response_model=StandardResponse[TemplateResponse])
def get_template(
    template_id: int,
    template_service: TemplateService = Depends(get_template_service),
    current_user: User = Depends(get_current_user_by_api_key)
):
    
    try:
        template = template_service.get_template_by_id(template_id, current_user.id)

        template_response = TemplateResponse.model_validate(template)

        
        return StandardResponse(
            status="success",
            message="Template retrieved successfully",
            data=template_response
        )

    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        # Log the error here if you have logging set up
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)

    )

@router.put("/{template_id}", response_model=StandardResponse[TemplateResponse])
async def update_template(
    template_id: int,
    template_update: TemplateUpdate,
    template_service: TemplateService = Depends(get_template_service),
    current_user: User = Depends(get_current_user_by_api_key)
):
    try:
        updated_template = template_service.update_template(
            template_id, 
            template_update, 
            current_user.id
        )
        
        # Use the updated_template variable, not update_template function name
        template_response = TemplateResponse.model_validate(updated_template)
        
        return StandardResponse(
            status="success",
            message="Template updated successfully",
            data=template_response
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error updating template: {str(e)}")  # Add logging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{template_id}", response_model=StandardResponse)
def delete_template(
    template_id: int,
    template_service: TemplateService = Depends(get_template_service),
    current_user: User = Depends(get_current_user_by_api_key)
):
    template_service.delete_template(template_id, current_user.id)
    
    return StandardResponse(
        status="success",
        message="Template deleted successfully"
    )