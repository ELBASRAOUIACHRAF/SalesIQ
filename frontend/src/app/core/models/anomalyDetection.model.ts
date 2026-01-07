/**
 * Anomaly Detection Models
 * Matches backend DTOs for detecting unusual sales patterns
 */

export interface AnomalyDetectionDto {
  date: string;                         // ISO date string
  salesValue: number;
  expectedValue: number;
  deviation: number;
  zScore: number;
  anomalyType: 'SPIKE' | 'DROP' | 'NORMAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isAnomaly: boolean;
}

// Default empty array
export const defaultAnomalies: AnomalyDetectionDto[] = [];
