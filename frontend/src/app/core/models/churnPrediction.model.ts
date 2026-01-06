/**
 * Churn Prediction Models
 * Matches backend DTOs for predicting which customers will churn
 */

export interface ChurnPredictionDto {
  userId: number;
  churnProbability: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  daysSinceLastPurchase: number;
  totalPurchases: number;
  totalSpent: number;
}

// Default empty array
export const defaultChurnPredictions: ChurnPredictionDto[] = [];
