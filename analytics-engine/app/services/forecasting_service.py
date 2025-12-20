import pandas as pd
from datetime import timedelta
# REMOVE statsmodels import from here
from app.api.models.salesforecast_model import (
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