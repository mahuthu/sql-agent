from fastapi import APIRouter, Depends, HTTPException
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

@router.post("/", response_model=StandardResponse)
def create_template(
    template: TemplateCreate,
    template_service: TemplateService = Depends(get_template_service),
    current_user: User = Depends(get_current_user_by_api_key)
):
    db_template = template_service.create_template(template, current_user.id)
    
    return StandardResponse(
        status="success",
        message="Template created successfully",
        data=db_template
    )

@router.get("/", response_model=StandardResponse)
def list_templates(
    template_service: TemplateService = Depends(get_template_service),
    current_user: User = Depends(get_current_user_by_api_key)
):
    templates = template_service.get_templates(current_user.id)
    
    return StandardResponse(
        status="success",
        message="Templates retrieved successfully",
        data=templates
    )

@router.get("/{template_id}", response_model=StandardResponse)
def get_template(
    template_id: int,
    template_service: TemplateService = Depends(get_template_service),
    current_user: User = Depends(get_current_user_by_api_key)
):
    template = template_service.get_template_by_id(template_id, current_user.id)
    
    return StandardResponse(
        status="success",
        message="Template retrieved successfully",
        data=template
    )

@router.put("/{template_id}", response_model=StandardResponse)
def update_template(
    template_id: int,
    template_update: TemplateUpdate,
    template_service: TemplateService = Depends(get_template_service),
    current_user: User = Depends(get_current_user_by_api_key)
):
    updated_template = template_service.update_template(
        template_id, 
        template_update, 
        current_user.id
    )
    
    return StandardResponse(
        status="success",
        message="Template updated successfully",
        data=updated_template
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