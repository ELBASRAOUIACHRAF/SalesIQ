/**
 * Sales Forecast Models
 * Matches backend DTOs: SalesForecastDto and ForecastPointDto
 */

// Matches ForecastPointDto.java
export interface ForecastPointDto {
  date: string;         // Format: "yyyy-MM-dd"
  predictedSales: number;
}

// Matches SalesForecastDto.java
export interface SalesForecastDto {
  model: string;        // e.g., "ARIMA", "Moving Average"
  daysAhead: number;    // Number of days forecasted
  forecast: ForecastPointDto[];
}

// Default empty forecast
export const defaultSalesForecast: SalesForecastDto = {
  model: 'N/A',
  daysAhead: 0,
  forecast: []
};
