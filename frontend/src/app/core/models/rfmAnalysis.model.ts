/**
 * RFM Analysis Models
 * Matches backend DTOs for RFM (Recency, Frequency, Monetary) segmentation
 * 
 * RFM segments customers based on:
 * - Recency: How recently they made a purchase
 * - Frequency: How often they purchase
 * - Monetary: How much they spend
 */

export interface RFMSegmentDto {
  customerId: number;
  recency: number;        // Days since last purchase
  frequency: number;      // Number of purchases
  monetary: number;       // Total amount spent
  rScore: number;         // Recency score (1-5)
  fScore: number;         // Frequency score (1-5)
  mScore: number;         // Monetary score (1-5)
  segment: string;        // Customer segment name
}

// Predefined RFM Segment names
export type RFMSegmentType = 
  | 'Champions'
  | 'Loyal Customers'
  | 'Potential Loyalists'
  | 'Recent Customers'
  | 'Promising'
  | 'Need Attention'
  | 'About to Sleep'
  | 'At Risk'
  | 'Cannot Lose Them'
  | 'Hibernating'
  | 'Lost';

// Default empty array
export const defaultRFMAnalysis: RFMSegmentDto[] = [];
