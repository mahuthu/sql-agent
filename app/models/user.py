from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    api_key = Column(String, unique=True, index=True)
    credits_remaining = Column(Integer, default=20)  # Start with 20 free credits
    subscription_status = Column(String, default="free")  # free, premium, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    stripe_customer_id = Column(String, unique=True, nullable=True)
    
    # Relationships
    templates = relationship("QueryTemplate", back_populates="user", cascade="all, delete-orphan")
    query_history = relationship("QueryHistory", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False)
