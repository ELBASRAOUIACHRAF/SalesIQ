/**
 * Variance Analysis Models
 * Matches backend DTOs for variance analysis
 */

// Revenue Variance
export interface RevenueVarianceDto {
  actual: number;
  expected: number;
  variance: number;
  variancePercent: number;
}

// Sales Variance
export interface SalesVarianceDto {
  actual: number;
  expected: number;
  variance: number;
  variancePercent: number;
}

// Customer Variance
export interface CustomerVarianceDto {
  actual: number;
  expected: number;
  variance: number;
  variancePercent: number;
}

// Product Variance
export interface ProductVarianceDto {
  actual: number;
  expected: number;
  variance: number;
  variancePercent: number;
}

// Category Variance
export interface CategoryVarianceDto {
  categoryName: string;
  actual: number;
  expected: number;
  variance: number;
  variancePercent: number;
}

// Monthly Variance
export interface MonthlyVarianceDto {
  month: string;
  actual: number;
  expected: number;
  variance: number;
  variancePercent: number;
}

// Variance Alert
export interface VarianceAlertDto {
  type: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Main Variance Analysis DTO
export interface VarianceAnalysisDto {
  startDate: string;
  endDate: string;
  generatedAt: string;

  revenueVariance: RevenueVarianceDto;
  salesVariance: SalesVarianceDto;
  customerVariance: CustomerVarianceDto;
  productVariance: ProductVarianceDto;

  categoryVariances: CategoryVarianceDto[];
  monthlyVariances: MonthlyVarianceDto[];

  overallVarianceScore: number;
  performanceStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  alerts: VarianceAlertDto[];
  recommendations: string[];
}

// Default empty variance analysis
export const defaultVarianceAnalysis: VarianceAnalysisDto = {
  startDate: '',
  endDate: '',
  generatedAt: '',
  revenueVariance: { actual: 0, expected: 0, variance: 0, variancePercent: 0 },
  salesVariance: { actual: 0, expected: 0, variance: 0, variancePercent: 0 },
  customerVariance: { actual: 0, expected: 0, variance: 0, variancePercent: 0 },
  productVariance: { actual: 0, expected: 0, variance: 0, variancePercent: 0 },
  categoryVariances: [],
  monthlyVariances: [],
  overallVarianceScore: 0,
  performanceStatus: 'FAIR',
  alerts: [],
  recommendations: []
};
