import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from typing import List
from app.api.models.churn_model import ChurnInputData, ChurnPredictionResponse

def predict_churn(customers: List[ChurnInputData]) -> List[ChurnPredictionResponse]:
    if not customers:
        return []

    features = np.array([
        [
            c.daysSinceLastPurchase,
            c.totalPurchases,
            c.totalSpent,
            c.avgOrderValue,
            c.purchaseFrequency
        ]
        for c in customers
    ])

    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    churn_scores = []
    for i, c in enumerate(customers):
        score = 0.0
        
        if c.daysSinceLastPurchase > 90:
            score += 0.4
        elif c.daysSinceLastPurchase > 60:
            score += 0.25
        elif c.daysSinceLastPurchase > 30:
            score += 0.1

        if c.totalPurchases <= 1:
            score += 0.3
        elif c.totalPurchases <= 3:
            score += 0.15

        if c.totalSpent < 50:
            score += 0.2
        elif c.totalSpent < 100:
            score += 0.1

        if c.avgOrderValue < 20:
            score += 0.1

        score = min(score, 1.0)
        churn_scores.append(score)

    results = []
    for i, c in enumerate(customers):
        probability = churn_scores[i]
        
        if probability >= 0.7:
            risk_level = "HIGH"
        elif probability >= 0.4:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        results.append(ChurnPredictionResponse(
            userId=c.userId,
            churnProbability=round(probability, 2),
            riskLevel=risk_level,
            daysSinceLastPurchase=c.daysSinceLastPurchase,
            totalPurchases=c.totalPurchases,
            totalSpent=c.totalSpent
        ))

    return results