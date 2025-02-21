from fastapi import Request, HTTPException
from typing import Dict, Tuple
import time
from collections import defaultdict
import threading

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = defaultdict(list)
        self.lock = threading.Lock()

    async def __call__(self, request: Request):
        client_ip = request.client.host
        
        with self.lock:
            now = time.time()
            # Remove requests older than 1 minute
            self.requests[client_ip] = [
                req_time for req_time in self.requests[client_ip]
                if now - req_time < 60
            ]
            
            if len(self.requests[client_ip]) >= self.requests_per_minute:
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests. Please try again later."
                )
            
            self.requests[client_ip].append(now) 