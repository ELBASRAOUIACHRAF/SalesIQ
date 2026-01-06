/**
 * Performance Scorecard Models
 * Matches backend DTOs for performance scoring
 */

// Financial Score
export interface FinancialScoreDto {
  score: number;
  grade: string;
  revenueGrowth: number;
  profitMargin: number;
  revenuePerEmployee: number;
}

// Customer Score
export interface CustomerScoreDto {
  score: number;
  grade: string;
  satisfactionRate: number;
  retentionRate: number;
  npsScore: number;
}

// Operations Score
export interface OperationsScoreDto {
  score: number;
  grade: string;
  inventoryTurnover: number;
  fulfillmentRate: number;
  returnRate: number;
}

// Product Score
export interface ProductScoreDto {
  score: number;
  grade: string;
  productDiversity: number;
  avgProductRating: number;
  newProductSuccess: number;
}

// KPI Item
export interface KPIItemDto {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'ABOVE_TARGET' | 'ON_TARGET' | 'BELOW_TARGET';
}

// Score History
export interface ScoreHistoryDto {
  date: string;
  score: number;
}

// Main Performance Scorecard DTO
export interface PerformanceScorecardDto {
  startDate: string;
  endDate: string;
  generatedAt: string;

  overallScore: number;
  overallGrade: string;

  financialScore: FinancialScoreDto;
  customerScore: CustomerScoreDto;
  operationsScore: OperationsScoreDto;
  productScore: ProductScoreDto;

  keyMetrics: KPIItemDto[];
  scoreHistory: ScoreHistoryDto[];
  strengths: string[];
  weaknesses: string[];
  actionItems: string[];
}

// Default empty scorecard
export const defaultPerformanceScorecard: PerformanceScorecardDto = {
  startDate: '',
  endDate: '',
  generatedAt: '',
  overallScore: 0,
  overallGrade: 'N/A',
  financialScore: { score: 0, grade: 'N/A', revenueGrowth: 0, profitMargin: 0, revenuePerEmployee: 0 },
  customerScore: { score: 0, grade: 'N/A', satisfactionRate: 0, retentionRate: 0, npsScore: 0 },
  operationsScore: { score: 0, grade: 'N/A', inventoryTurnover: 0, fulfillmentRate: 0, returnRate: 0 },
  productScore: { score: 0, grade: 'N/A', productDiversity: 0, avgProductRating: 0, newProductSuccess: 0 },
  keyMetrics: [],
  scoreHistory: [],
  strengths: [],
  weaknesses: [],
  actionItems: []
};
