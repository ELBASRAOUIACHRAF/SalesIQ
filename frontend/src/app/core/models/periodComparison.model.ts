/**
 * Period Comparison Models
 * Matches backend DTOs for comparing two time periods
 */

export interface PeriodComparisonDto {
  period1Start: string;
  period1End: string;
  period2Start: string;
  period2End: string;

  period1Revenue: number;
  period2Revenue: number;
  revenueChange: number;
  revenueChangePercent: number;

  period1Orders: number;
  period2Orders: number;
  ordersChange: number;
  ordersChangePercent: number;

  period1Customers: number;
  period2Customers: number;
  customersChange: number;
  customersChangePercent: number;

  period1ProductsSold: number;
  period2ProductsSold: number;
  productsSoldChange: number;
  productsSoldChangePercent: number;

  period1AvgOrderValue: number;
  period2AvgOrderValue: number;
  avgOrderValueChange: number;
  avgOrderValueChangePercent: number;

  overallTrend: 'IMPROVING' | 'DECLINING' | 'STABLE';
}

// Default empty comparison
export const defaultPeriodComparison: PeriodComparisonDto = {
  period1Start: '',
  period1End: '',
  period2Start: '',
  period2End: '',
  period1Revenue: 0,
  period2Revenue: 0,
  revenueChange: 0,
  revenueChangePercent: 0,
  period1Orders: 0,
  period2Orders: 0,
  ordersChange: 0,
  ordersChangePercent: 0,
  period1Customers: 0,
  period2Customers: 0,
  customersChange: 0,
  customersChangePercent: 0,
  period1ProductsSold: 0,
  period2ProductsSold: 0,
  productsSoldChange: 0,
  productsSoldChangePercent: 0,
  period1AvgOrderValue: 0,
  period2AvgOrderValue: 0,
  avgOrderValueChange: 0,
  avgOrderValueChangePercent: 0,
  overallTrend: 'STABLE'
};
