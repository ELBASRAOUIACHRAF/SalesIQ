/**
 * Purchase Frequency Analysis Model
 * Matches backend DTO: PurchaseFrequencyAnalysisDto
 * 
 * Analyzes customer purchasing behavior:
 * - Total number of purchases per customer
 * - Average monthly purchase frequency
 */

export interface PurchaseFrequencyAnalysisDto {
  userId: number;
  username: string;
  totalSales: number;
  averageSalesPerMonth: number;
}

// Default empty array
export const defaultPurchaseFrequency: PurchaseFrequencyAnalysisDto[] = [];
