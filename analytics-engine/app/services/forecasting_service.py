from typing import List
import pandas as pd
from datetime import timedelta
from sklearn.cluster import KMeans
# REMOVE statsmodels import from here
from app.api.models.salesforecast_model import (
    CustomerData,
    SalesForecastRequest,
    SalesForecastResponse,
    ForecastPoint
)

def forecast_sales(request: SalesForecastRequest) -> SalesForecastResponse :
    
    """
    don't forget, request contains a the model, the days ahead
    and also the forecast, which a list of forecast dtos containing the date
    and the value.
    """
    from statsmodels.tsa.arima.model import ARIMA

    historical_data = request.forecast
    days_ahead = request.daysAhead
    if not historical_data:
        return SalesForecastResponse(
            model=request.model,
            forecast=[]
        )
    if days_ahead <= 0:
        return SalesForecastResponse(
            model=request.model,
            forecast=[]
        )
    df_list = [
        {
            'date' : point.date,
            'sales' : point.predictedSales
        }
        for point in historical_data
    ]
    df = pd.DataFrame(df_list)
    df = df.sort_values('date').reset_index(drop=True)
    # extract sales for ARIMA model ajemi
    sales_values = df['sales'].values
    # if them sales are not enough do this
    if (len(sales_values) < 3):
        return _simple_average_forecast(df, days_ahead, request.model)
    
    # fit ARIMA Model
    try :
        model = ARIMA(sales_values, order=(1, 1, 1))
        fitted_model = model.fit()

        predictions = fitted_model.forecast(steps=days_ahead)

    except Exception as e :
        print(f"ARIMA failed: {e}. Falling back to simple average.")
        return _simple_average_forecast(df, days_ahead, request.model)
    
    last_date = df['date'].iloc[-1]
    forecast_points = []
    for i in range(days_ahead) :
        forecast_date = last_date + timedelta(days = i + 1)
        predicted_value = float(predictions[i])

        predicted_value = max(0, predicted_value)

        forecast_points.append(ForecastPoint(
            date=forecast_date,
            predictedSales=round(predicted_value, 2)
        ))
    return SalesForecastResponse(
        model=request.model,
        forecast=forecast_points
    )

def _simple_average_forecast(
    df: pd.DataFrame,
    days_ahead: int,
    model_name: str
) -> SalesForecastResponse:
    avg_sales = df['sales'].mean()
    last_date = df['date'].iloc[-1]

    forecast_points = []
    for i in range(days_ahead) : 
        forecast_date = last_date + timedelta(days=i+1)
        forecast_points.append(ForecastPoint(
            date=forecast_date,
            predictedSales=round(avg_sales, 2)
        ))
    return SalesForecastResponse(
        model=f"{model_name} (fallback: Simple Average)",
        forecast=forecast_points
    )


# --- LOGIQUE DE SEGMENTATION (K-MEANS) ---
def segment_customers(self, customers: List[CustomerData], n_segments: int):
        
    df = pd.DataFrame([c.model_dump() for c in customers])
        
    if df.empty or len(df) < n_segments:
        return []

        # Entraînement sur TOUTES les features sauf l'ID
    X = df.drop(columns=['usersId'])
    X = X.fillna(0) # Sécurité pour les divisions par zéro de Java

    model = KMeans(n_clusters=n_segments, random_state=42, n_init='auto')
    df['segment'] = model.fit_predict(X)

        # Identification des segments
    profiles = df.groupby('segment')['totalSpent'].mean()
    vip_idx = profiles.idxmax()
    low_idx = profiles.idxmin()

    def label_mapping(s):
        if s == vip_idx: return 'VIP'
        if s == low_idx: return 'LOW_ENGAGEMENT'
        return 'ACTIVE_BUYER'

    df['segment_label'] = df['segment'].apply(label_mapping)

        # Formatage du retour
    results = []
    for label, group in df.groupby('segment_label'):
        results.append({
                "segmentId": label,
                "customerIds": group['usersId'].tolist(),
                "description": f"{label} - {len(group)} clients"
        })
    return results