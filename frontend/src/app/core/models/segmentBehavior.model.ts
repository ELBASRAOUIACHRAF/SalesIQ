/**
 * Segment Behavior Models
 * Matches backend DTOs for segment behavior analysis
 */

export interface SegmentBehaviorAnalysisDto {
  segmentName: string;
  totalUsers: number;
  totalPurchases: number;
  totalRevenue: number;
  avgOrderValue: number;
  avgPurchasesPerUser: number;
  totalProductsBought: number;
}

// Default empty segment behavior
export const defaultSegmentBehavior: SegmentBehaviorAnalysisDto = {
  segmentName: '',
  totalUsers: 0,
  totalPurchases: 0,
  totalRevenue: 0,
  avgOrderValue: 0,
  avgPurchasesPerUser: 0,
  totalProductsBought: 0
};
