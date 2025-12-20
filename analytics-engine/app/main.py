from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import sales_forecast

app = FastAPI(
    title="Analytics API",
    description="Microservice for analytics and machine learning",
    version="1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    sales_forecast.router,
    prefix="/api/v1",
    tags=["Sales Forecasting"]
)

@app.get("/")
async def root():
    return {"status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}