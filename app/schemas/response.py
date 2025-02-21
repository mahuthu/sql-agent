from pydantic import BaseModel
from typing import Optional, Any, Dict

class StandardResponse(BaseModel):
    status: str
    message: str
    data: Optional[Any] = None
    error: Optional[Dict] = None 