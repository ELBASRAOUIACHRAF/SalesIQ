/**
 * Ranking Prediction Models
 * Matches backend DTOs for product ranking predictions
 */

export interface RankingPredictionDto {
  productId: number;
  productName: string;
  currentRank: number;
  predictedRank: number;
  currentSales: number;
  predictedSales: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  daysAhead: number;
}

// Default empty ranking prediction
export const defaultRankingPrediction: RankingPredictionDto = {
  productId: 0,
  productName: '',
  currentRank: 0,
  predictedRank: 0,
  currentSales: 0,
  predictedSales: 0,
  trend: 'STABLE',
  daysAhead: 7
};
