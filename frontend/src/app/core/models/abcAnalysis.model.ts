/**
 * ABC Analysis Models
 * Matches backend DTOs: ABCAnalysisDto and ABCProductDto
 * 
 * ABC Analysis classifies products based on revenue contribution:
 * - Class A: Top products contributing to ~80% of revenue
 * - Class B: Products contributing to next ~15% of revenue  
 * - Class C: Remaining products contributing to ~5% of revenue
 */

// Matches ABCProductDto.java
export interface ABCProductDto {
  productId: number;
  productName: string;
  revenue: number;
  revenuePercentage: number;
  cumulativePercentage: number;
  abcClass: 'A' | 'B' | 'C';
}

// Matches ABCAnalysisDto.java
export interface ABCAnalysisDto {
  classA: ABCProductDto[];
  classB: ABCProductDto[];
  classC: ABCProductDto[];
  totalRevenue: number;
}

// Default empty analysis
export const defaultABCAnalysis: ABCAnalysisDto = {
  classA: [],
  classB: [],
  classC: [],
  totalRevenue: 0
};
