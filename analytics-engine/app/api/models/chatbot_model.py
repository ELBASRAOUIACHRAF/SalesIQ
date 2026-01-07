from typing import Optional, Dict
from pydantic import BaseModel


class ChatRequest(BaseModel):
    sessionId: str
    message: str
    includeRealTimeData: bool = False
    dataFilters: Optional[Dict] = None


class ChatResponse(BaseModel):
    sessionId: str
    response: str


class ClearSessionRequest(BaseModel):
    sessionId: str
