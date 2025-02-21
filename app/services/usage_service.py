from sqlalchemy.orm import Session
from app.models.user import User
from app.models.query_history import QueryHistory
from datetime import datetime, timedelta
from typing import Dict
import json

class UsageService:
    @staticmethod
    def track_query_usage(
        db: Session,
        user_id: int,
        template_id: int,
        tokens_used: int,
        execution_time: float
    ):
        """Track query usage for billing and monitoring"""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            # Deduct credits based on token usage
            credits_to_deduct = tokens_used / 1000  # 1 credit per 1000 tokens
            user.credits_remaining -= credits_to_deduct
            db.commit()

    @staticmethod
    def get_usage_stats(db: Session, user_id: int) -> Dict:
        """Get usage statistics for a user"""
        now = datetime.utcnow()
        month_ago = now - timedelta(days=30)
        
        # Get monthly queries count
        monthly_queries = db.query(QueryHistory).filter(
            QueryHistory.user_id == user_id,
            QueryHistory.created_at >= month_ago
        ).count()
        
        # Get success rate
        total_queries = db.query(QueryHistory).filter(
            QueryHistory.user_id == user_id
        ).count()
        
        successful_queries = db.query(QueryHistory).filter(
            QueryHistory.user_id == user_id,
            QueryHistory.status == "success"
        ).count()
        
        success_rate = (successful_queries / total_queries * 100) if total_queries > 0 else 0
        
        return {
            "monthly_queries": monthly_queries,
            "total_queries": total_queries,
            "success_rate": success_rate
        } 