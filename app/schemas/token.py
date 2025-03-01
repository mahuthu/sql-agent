from pydantic import BaseModel
from typing import Dict

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict

class TokenData(BaseModel):
    email: str | None = None 