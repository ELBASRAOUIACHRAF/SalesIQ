/**
 * Product Lifecycle Models
 * Matches backend DTOs for product lifecycle analysis
 */

export type ProductLifecyclePhase = 'INTRODUCTION' | 'GROWTH' | 'MATURITY' | 'DECLINE';

export interface ProductLifecycleDto {
  productId: number;
  phase: ProductLifecyclePhase;
  avgMonthlySales: number;
  salesGrowth: number;
}

// Default empty lifecycle
export const defaultProductLifecycle: ProductLifecycleDto = {
  productId: 0,
  phase: 'INTRODUCTION',
  avgMonthlySales: 0,
  salesGrowth: 0
};
