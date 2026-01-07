export interface ReviewsSentimentAnalysisDto {
  productId: number;
  totalReviews: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  overallSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

export const defaultReviewsSentiment: ReviewsSentimentAnalysisDto[] = [];
