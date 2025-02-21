from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    api_key: str
    is_active: bool
    subscription_status: str
    credits_remaining: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True