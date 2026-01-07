import numpy as np
from typing import List
from sklearn.ensemble import IsolationForest
from app.api.models.anomaly_model import AnomalyDetectionRequest, AnomalyDetectionResponse, DailySales

def calculate_moving_average(values: List[float], window: int = 7) -> List[float]:
    result = []
    for i in range(len(values)):
        start = max(0, i - window + 1)
        result.append(np.mean(values[start:i + 1]))
    return result

def detect_anomalies(request: AnomalyDetectionRequest) -> List[AnomalyDetectionResponse]:
    if not request.salesData or len(request.salesData) < 3:
        return []

    sales_data = sorted(request.salesData, key=lambda x: x.date)
    sales_values = [s.sales for s in sales_data]
    dates = [s.date for s in sales_data]

    mean_sales = np.mean(sales_values)
    std_sales = np.std(sales_values)

    moving_avg = calculate_moving_average(sales_values, window=7)

    z_scores = []
    for value in sales_values:
        if std_sales > 0:
            z_score = (value - mean_sales) / std_sales
        else:
            z_score = 0.0
        z_scores.append(z_score)

    isolation_anomalies = []
    if len(sales_values) >= 10:
        try:
            X = np.array(sales_values).reshape(-1, 1)
            iso_forest = IsolationForest(contamination=0.1, random_state=42)
            predictions = iso_forest.fit_predict(X)
            isolation_anomalies = [p == -1 for p in predictions]
        except:
            isolation_anomalies = [False] * len(sales_values)
    else:
        isolation_anomalies = [False] * len(sales_values)

    results = []
    threshold = request.sensitivityThreshold

    for i in range(len(sales_data)):
        z_score = z_scores[i]
        is_z_anomaly = abs(z_score) > threshold
        is_iso_anomaly = isolation_anomalies[i] if i < len(isolation_anomalies) else False
        is_anomaly = is_z_anomaly or is_iso_anomaly

        if z_score > threshold:
            anomaly_type = "SPIKE"
        elif z_score < -threshold:
            anomaly_type = "DROP"
        else:
            anomaly_type = "NORMAL"

        if abs(z_score) > 3:
            severity = "CRITICAL"
        elif abs(z_score) > 2.5:
            severity = "HIGH"
        elif abs(z_score) > 2:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        deviation = sales_values[i] - moving_avg[i]

        results.append(AnomalyDetectionResponse(
            date=dates[i],
            salesValue=round(sales_values[i], 2),
            expectedValue=round(moving_avg[i], 2),
            deviation=round(deviation, 2),
            zScore=round(z_score, 2),
            anomalyType=anomaly_type,
            severity=severity if is_anomaly else "NONE",
            isAnomaly=is_anomaly
        ))

    return results