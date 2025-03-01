from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from ..models.template import QueryTemplate
from ..schemas.template import TemplateCreate, TemplateUpdate, TemplateResponse
from ..models.user import User
import json

class TemplateService:
    def __init__(self, db: Session):
        self.db = db

    def get_templates(self, user_id: int, include_public: bool = True) -> List[QueryTemplate]:
        """Get all templates accessible by the user."""
        query = self.db.query(QueryTemplate).filter(
            (QueryTemplate.user_id == user_id) |
            (QueryTemplate.is_public == True if include_public else False)
        )
        return query.all()

    def get_template_by_id(self, template_id: int, user_id: int) -> Optional[QueryTemplate]:
        """Get a specific template by ID and verify ownership."""
        template = self.db.query(QueryTemplate).filter(
            QueryTemplate.id == template_id,
            QueryTemplate.user_id == user_id
        ).first()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found or access denied"
            )
        
        return template

    def create_template(self, template_data: TemplateCreate, user_id: int) -> QueryTemplate:
        """Create a new template."""
        db_template = QueryTemplate(
            **template_data.dict(),
            user_id=user_id
        )
        
        try:
            self.db.add(db_template)
            self.db.commit()
            self.db.refresh(db_template)
            return db_template
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not create template: {str(e)}"
            )

    def update_template(
        self, 
        template_id: int, 
        template_data: TemplateUpdate, 
        user_id: int
    ) -> QueryTemplate:
        """Update an existing template."""
        try:
            # Get existing template and verify ownership
            template = self.get_template_by_id(template_id, user_id)
            
            if not template:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Template not found"
                )
            
            if template.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot modify templates owned by other users"
                )

            # Update only the fields that were provided
            update_data = template_data.model_dump(exclude_unset=True)
            
            # Handle example_queries specially if it exists
            if 'example_queries' in update_data:
                # Ensure example_queries is properly formatted
                if isinstance(update_data['example_queries'], str):
                    try:
                        update_data['example_queries'] = json.loads(update_data['example_queries'])
                    except json.JSONDecodeError:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid example_queries format"
                        )

            # Update the template fields
            for field, value in update_data.items():
                setattr(template, field, value)

            try:
                self.db.commit()
                self.db.refresh(template)
                return template
            except Exception as e:
                self.db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Could not update template: {str(e)}"
                )

        except HTTPException as he:
            raise he
        except Exception as e:
            print(f"Error in update_template: {str(e)}")  # Add logging
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update template: {str(e)}"
            )

    def delete_template(self, template_id: int, user_id: int) -> bool:
        """Delete a template."""
        template = self.get_template_by_id(template_id, user_id)
        
        # Check if user owns this template
        if template.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot delete templates owned by other users"
            )

        try:
            self.db.delete(template)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not delete template: {str(e)}"
            )

    def validate_template(self, template_data: dict) -> bool:
        """Validate template data before creation/update."""
        # Add validation logic here
        # For example: check if database connection is valid
        # Check if example queries are valid SQL
        return True 