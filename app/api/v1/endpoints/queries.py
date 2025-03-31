from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user_by_api_key, check_credits
from app.models.user import User
from app.models.template import QueryTemplate
from app.models.query_history import QueryHistory
from app.core.agent import SQLQueryAgent
from app.schemas.response import StandardResponse
from typing import Dict, List
from pydantic import BaseModel
from datetime import datetime, timedelta
import time
from app.schemas.query_history import QueryHistoryResponse

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

@router.post("/{template_id}", response_model=StandardResponse)
async def execute_query(
    template_id: int,
    query: QueryRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_by_api_key)
):
    """Execute a natural language query using a specific template"""
    
    # Check credits before executing query
    if current_user.subscription_status == "free":
        await check_credits(current_user, db)
    
    # Get the template
    template = db.query(QueryTemplate).filter(
        QueryTemplate.id == template_id,
        (QueryTemplate.user_id == current_user.id) | (QueryTemplate.is_public == True)
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    start_time = time.time()
    try:
        # Initialize the agent
        agent = SQLQueryAgent(
            db_uri=template.database_uri,
            example_queries=template.example_queries
        )
        
        # Execute the query
        result = agent.query(query.question)
        execution_time = time.time() - start_time
        
        # Record query history in background
        background_tasks.add_task(
            record_query_history,
            db=db,
            user_id=current_user.id,
            template_id=template_id,
            question=query.question,
            generated_sql=result.get("sql", ""),
            execution_time=execution_time,
            status="success",
            error_message=None
        )
        
        # Deduct credits
        current_user.credits_remaining -= 1
        db.commit()
        
        # Format the result for the frontend
        formatted_result = {
            "sql": result.get("sql", ""),
            "result": result.get("result", []),  # This should be the actual query results
            "explanation": result.get("explanation", "")
        }
        
        return StandardResponse(
            status="success",
            message="Query executed successfully",
            data=formatted_result
        )
        
    except Exception as e:
        execution_time = time.time() - start_time
        # Record failed query in background
        background_tasks.add_task(
            record_query_history,
            db=db,
            user_id=current_user.id,
            template_id=template_id,
            question=query.question,
            generated_sql="",
            execution_time=execution_time,
            status="error",
            error_message=str(e)
        )
        
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/history", response_model=StandardResponse[List[QueryHistoryResponse]])
async def get_query_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_by_api_key)
):
    """Get user's query history"""
    try:
        # Get history records
        history = db.query(QueryHistory).filter(
            QueryHistory.user_id == current_user.id
        ).order_by(QueryHistory.created_at.desc()).all()
        
        # Convert to response models
        history_responses = [
            QueryHistoryResponse.model_validate(record) 
            for record in history
        ]
        
        return StandardResponse(
            status="success",
            message="Query history retrieved successfully",
            data=history_responses
        )
    except Exception as e:
        print(f"Error fetching query history: {str(e)}")  # Add logging
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve query history: {str(e)}"
        )

@router.get("/stats", response_model=StandardResponse)
async def get_usage_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_by_api_key)
):
    """Get usage statistics for the current user"""
    try:
        # Get queries from the last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_queries = db.query(QueryHistory).filter(
            QueryHistory.user_id == current_user.id,
            QueryHistory.created_at >= thirty_days_ago
        ).all()
        
        # Refresh user data to get current credits
        user = db.query(User).filter(User.id == current_user.id).first()
        
        # Calculate statistics
        total_queries = len(recent_queries)
        successful_queries = len([q for q in recent_queries if q.status == "success"])
        failed_queries = total_queries - successful_queries
        avg_execution_time = sum([q.execution_time for q in recent_queries]) / total_queries if total_queries > 0 else 0
        
        stats = {
            "total_queries": total_queries,
            "successful_queries": successful_queries,
            "failed_queries": failed_queries,
            "average_execution_time": round(avg_execution_time, 2),
            "queries_by_day": get_queries_by_day(recent_queries),
            "credits_remaining": user.credits_remaining,  # Add user credits to stats
            "subscription_status": user.subscription_status  # Add subscription status if needed
        }
        
        return StandardResponse(
            status="success",
            message="Usage statistics retrieved",
            data=stats
        )
    except Exception as e:
        print(f"Error getting stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve usage statistics"
        )

@router.get("/detailed", response_model=StandardResponse)
async def get_detailed_usage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_by_api_key)
):
    """Get detailed usage information"""
    # Get all queries
    queries = db.query(QueryHistory).filter(
        QueryHistory.user_id == current_user.id
    ).order_by(QueryHistory.created_at.desc()).all()
    
    # Get template usage
    template_usage = {}
    for query in queries:
        template_id = str(query.template_id)
        if template_id not in template_usage:
            template_usage[template_id] = {
                "total": 0,
                "successful": 0,
                "failed": 0,
                "template_name": query.template.name if query.template else "Unknown"
            }
        
        template_usage[template_id]["total"] += 1
        if query.status == "success":
            template_usage[template_id]["successful"] += 1
        else:
            template_usage[template_id]["failed"] += 1
    
    detailed_stats = {
        "template_usage": template_usage,
        "recent_queries": [
            {
                "id": q.id,
                "question": q.question,
                "status": q.status,
                "execution_time": q.execution_time,
                "created_at": q.created_at,
                "template_name": q.template.name if q.template else "Unknown"
            }
            for q in queries[:10]  # Last 10 queries
        ]
    }
    
    return StandardResponse(
        status="success",
        message="Detailed usage information retrieved",
        data=detailed_stats
    )

def get_queries_by_day(queries: List[QueryHistory]) -> Dict:
    """Helper function to group queries by day"""
    queries_by_day = {}
    for query in queries:
        day = query.created_at.date().isoformat()
        if day not in queries_by_day:
            queries_by_day[day] = {
                "total": 0,
                "successful": 0,
                "failed": 0
            }
        
        queries_by_day[day]["total"] += 1
        if query.status == "success":
            queries_by_day[day]["successful"] += 1
        else:
            queries_by_day[day]["failed"] += 1
    
    return queries_by_day

def record_query_history(
    db: Session,
    user_id: int,
    template_id: int,
    question: str,
    generated_sql: str,
    execution_time: float,
    status: str,
    error_message: str = None
):
    """Record query execution in history"""
    history_entry = QueryHistory(
        user_id=user_id,
        template_id=template_id,
        question=question,
        generated_sql=generated_sql,
        execution_time=execution_time,
        status=status,
        error_message=error_message
    )
    db.add(history_entry)
    db.commit() 