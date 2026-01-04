import pandas as pd
import numpy as np
from datetime import timedelta
from typing import List
from app.api.models.ranking_model import (
    RankingPredictionRequest,
    RankingPredictionResponse,
    ProductSalesInput
)

def predict_product_sales(product: ProductSalesInput) -> float:
    if not product.historicalSales or len(product.historicalSales) < 2:
        if product.historicalSales:
            return product.historicalSales[-1].sales * product.daysAhead
        return 0.0

    df = pd.DataFrame([
        {'date': s.date, 'sales': s.sales}
        for s in product.historicalSales
    ])
    df = df.sort_values('date').reset_index(drop=True)

    sales_values = df['sales'].values

    if len(sales_values) >= 3:
        try:
            from statsmodels.tsa.arima.model import ARIMA
            model = ARIMA(sales_values, order=(1, 1, 1))
            fitted = model.fit()
            predictions = fitted.forecast(steps=product.daysAhead)
            return max(0, sum(predictions))
        except:
            pass

    avg_daily = df['sales'].mean()
    return avg_daily * product.daysAhead


def predict_ranking(request: RankingPredictionRequest) -> RankingPredictionResponse:
    if not request.allProducts:
        return RankingPredictionResponse(
            productId=request.targetProductId,
            productName="",
            currentRank=0,
            predictedRank=0,
            currentSales=0.0,
            predictedSales=0.0,
            trend="STABLE",
            daysAhead=request.daysAhead
        )

    current_sales = []
    predicted_sales = []

    for product in request.allProducts:
        total_current = sum(s.sales for s in product.historicalSales) if product.historicalSales else 0.0
        total_predicted = total_current + predict_product_sales(product)

        current_sales.append({
            'productId': product.productId,
            'productName': product.productName,
            'sales': total_current
        })

        predicted_sales.append({
            'productId': product.productId,
            'productName': product.productName,
            'sales': total_predicted
        })

    current_sorted = sorted(current_sales, key=lambda x: x['sales'], reverse=True)
    predicted_sorted = sorted(predicted_sales, key=lambda x: x['sales'], reverse=True)

    current_rank = 0
    current_total = 0.0
    target_name = ""

    for i, p in enumerate(current_sorted):
        if p['productId'] == request.targetProductId:
            current_rank = i + 1
            current_total = p['sales']
            target_name = p['productName']
            break

    predicted_rank = 0
    predicted_total = 0.0

    for i, p in enumerate(predicted_sorted):
        if p['productId'] == request.targetProductId:
            predicted_rank = i + 1
            predicted_total = p['sales']
            break

    if predicted_rank < current_rank:
        trend = "UP"
    elif predicted_rank > current_rank:
        trend = "DOWN"
    else:
        trend = "STABLE"

    return RankingPredictionResponse(
        productId=request.targetProductId,
        productName=target_name,
        currentRank=current_rank,
        predictedRank=predicted_rank,
        currentSales=round(current_total, 2),
        predictedSales=round(predicted_total, 2),
        trend=trend,
        daysAhead=request.daysAhead
    )