from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException

from app.api.models.chatbot_model import ChatRequest, ChatResponse, ClearSessionRequest
from app.services.chatbot_service import get_chatbot

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot Analytics"]
)

SPRING_BOOT_URL = "http://localhost:8080/api/v1/analytics"


async def fetch_real_time_data(filters: Optional[dict] = None) -> dict:
    data: dict = {}

    if not filters:
        return data

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            start = filters.get("startDate")
            end = filters.get("endDate")

            if start and end:
                try:
                    kpis_response = await client.get(
                        f"{SPRING_BOOT_URL}/kpis",
                        params={"startDate": start, "endDate": end}
                    )
                    if kpis_response.status_code == 200:
                        data["kpis"] = kpis_response.json()
                except Exception:
                    pass

                try:
                    churn_response = await client.get(
                        f"{SPRING_BOOT_URL}/churn-rate",
                        params={"startDate": start, "endDate": end}
                    )
                    if churn_response.status_code == 200:
                        data["churn"] = churn_response.json()
                except Exception:
                    pass

                try:
                    dashboard_response = await client.get(
                        f"{SPRING_BOOT_URL}/executive-dashboard",
                        params={"startDate": start, "endDate": end}
                    )
                    if dashboard_response.status_code == 200:
                        dashboard = dashboard_response.json()
                        data["topProducts"] = dashboard.get("topProducts", [])
                        data["topCategories"] = dashboard.get("topCategories", [])
                except Exception:
                    pass

    except Exception as e:
        print(f"Error fetching real-time data: {e}")

    return data


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        chatbot = get_chatbot()

        real_time_data = None
        if request.includeRealTimeData:
            real_time_data = await fetch_real_time_data(request.dataFilters)

        response = chatbot.chat(
            session_id=request.sessionId,
            message=request.message,
            real_time_data=real_time_data
        )

        return ChatResponse(
            sessionId=request.sessionId,
            response=response
        )
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.post("/clear-session")
async def clear_session(request: ClearSessionRequest):
    try:
        chatbot = get_chatbot()
        chatbot.clear_session(request.sessionId)
        return {"status": "success", "message": "Session cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clear session error: {str(e)}")


@router.get("/health")
async def health_check():
    try:
        chatbot = get_chatbot()
        return {
            "status": "operational",
            "vectorstore_ready": chatbot.vectorstore is not None
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
