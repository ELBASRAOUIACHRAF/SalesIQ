export interface CategoryPerformanceDto {
  categoryId: number;
  categoryName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalSales: number;
}

export const defaultCategoryPerformance: CategoryPerformanceDto[] = [];
