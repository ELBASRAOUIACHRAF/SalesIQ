/**
 * Stockout Prediction Models
 * Matches backend DTOs for predicting inventory stockouts
 */

export interface StockoutPredictionDto {
  productId: number;
  productName: string;
  currentStock: number;
  avgDailySales: number;
  daysUntilStockout: number;
  stockoutProbability: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  predictedDemand: number;
  recommendedRestock: number;
}

// Default empty array
export const defaultStockoutPredictions: StockoutPredictionDto[] = [];
