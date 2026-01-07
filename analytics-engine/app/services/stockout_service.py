import numpy as np
from typing import List
from app.api.models.stockout_model import StockoutInput, StockoutPredictionResponse

def forecast_demand(sales: List[float], days_ahead: int) -> float:
    if not sales:
        return 0.0
    
    if len(sales) >= 3:
        try:
            from statsmodels.tsa.arima.model import ARIMA
            model = ARIMA(sales, order=(1, 1, 1))
            fitted = model.fit()
            predictions = fitted.forecast(steps=days_ahead)
            return max(0, sum(predictions))
        except:
            pass
    
    avg_daily = np.mean(sales)
    return avg_daily * days_ahead

def predict_stockouts(products: List[StockoutInput]) -> List[StockoutPredictionResponse]:
    if not products:
        return []
    
    results = []
    
    for product in products:
        sales_values = [s.sales for s in product.recentSales]
        
        if sales_values:
            avg_daily_sales = np.mean(sales_values)
            std_daily_sales = np.std(sales_values) if len(sales_values) > 1 else 0
        else:
            avg_daily_sales = 0.0
            std_daily_sales = 0.0
        
        predicted_demand = forecast_demand(sales_values, product.daysAhead)
        
        if avg_daily_sales > 0:
            days_until_stockout = int(product.currentStock / avg_daily_sales)
        else:
            days_until_stockout = 999
        
        if days_until_stockout <= 0:
            stockout_probability = 1.0
        elif days_until_stockout <= product.daysAhead:
            buffer = product.currentStock - predicted_demand
            if buffer <= 0:
                stockout_probability = 0.95
            else:
                stockout_probability = max(0, 1 - (buffer / product.currentStock))
        else:
            safety_margin = days_until_stockout - product.daysAhead
            stockout_probability = max(0, 0.5 - (safety_margin * 0.05))
        
        if stockout_probability >= 0.7:
            risk_level = "CRITICAL"
        elif stockout_probability >= 0.5:
            risk_level = "HIGH"
        elif stockout_probability >= 0.3:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        safety_stock = avg_daily_sales * 7
        recommended_restock = max(0, int(predicted_demand + safety_stock - product.currentStock))
        
        results.append(StockoutPredictionResponse(
            productId=product.productId,
            productName=product.productName,
            currentStock=product.currentStock,
            avgDailySales=round(avg_daily_sales, 2),
            daysUntilStockout=min(days_until_stockout, 999),
            stockoutProbability=round(stockout_probability, 2),
            riskLevel=risk_level,
            predictedDemand=round(predicted_demand, 2),
            recommendedRestock=recommended_restock
        ))
    
    results.sort(key=lambda x: x.stockoutProbability, reverse=True)
    
    return results