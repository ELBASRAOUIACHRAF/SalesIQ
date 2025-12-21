from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import recommendation, sales_forecast
from app.services.recommendation_service import reco_service

app = FastAPI(
    title="Analytics API",
    description="Microservice for analytics and machine learning",
    version="1.0",
)

@app.on_event("startup") 
async def startup_event():
    # Cela permet de charger le fichier .pkl en mémoire dès que le serveur s'allume
    # pour éviter que le premier utilisateur n'attende.
    print("Démarrage : Chargement des modèles IA...")
    reco_service.load_model()

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

app.include_router(          
    recommendation.router,
    prefix="/api/v1/recommendation",
    tags=["Recommendation"]
)

@app.get("/")
async def root():
    return {"status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}