/**
 * Churn Analysis Models
 * Matches backend DTOs for churn rate analysis
 */

// Churn Rate Analysis - overall churn metrics
export interface ChurnAnalysisDto {
  usersAtStart: number;
  usersLost: number;
  churnRate: number;
  activeUsers: number;
  totalUsersAtEnd: number;
}

// Default empty analysis
export const defaultChurnAnalysis: ChurnAnalysisDto = {
  usersAtStart: 0,
  usersLost: 0,
  churnRate: 0,
  activeUsers: 0,
  totalUsersAtEnd: 0
};
