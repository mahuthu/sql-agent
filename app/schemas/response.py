from pydantic import BaseModel
# from typing import Optional, Any, Dict
from typing import Optional, Any, Dict, TypeVar, Generic

T = TypeVar('T')


class StandardResponse(BaseModel, Generic[T]):
    status: str
    message: str
    data: Optional[Any] = None
    error: Optional[Dict] = None 