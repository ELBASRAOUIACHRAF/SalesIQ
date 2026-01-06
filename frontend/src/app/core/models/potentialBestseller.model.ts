/**
 * Potential Bestseller Models
 * Matches backend DTOs for identifying products likely to become bestsellers
 */

export interface PotentialBestSellerDto {
  productId: number;
  productName: string;
  categoryName: string;
  currentSales: number;
  salesGrowthRate: number;
  potentialScore: number;
  potentialLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  totalReviews: number;
  avgRating: number;
  daysOnMarket: number;
}

// Default empty array
export const defaultPotentialBestsellers: PotentialBestSellerDto[] = [];
