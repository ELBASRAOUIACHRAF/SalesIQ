/**
 * Step 2: Frontend TypeScript Models
 * These interfaces mirror the backend DTOs for type safety
 */

// Enum matching backend TimeGranularity
export type TimeGranularity = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

// Matches SalesTrendPointDto.java
export interface SalesTrendPointDto {
  periodStart: string;      // ISO date string from LocalDateTime
  revenue: number;
  salesCount: number;
  quantitySold: number;
  averageSaleValue: number;
}

// Matches SalesTrendAnalysisDto.java
export interface SalesTrendAnalysisDto {
  startDate: string;        // ISO date string from LocalDateTime
  endDate: string;          // ISO date string from LocalDateTime
  timeGranularity: TimeGranularity;
  points: SalesTrendPointDto[];
}

// Default empty response for fallback
export const defaultSalesTrendAnalysis: SalesTrendAnalysisDto = {
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  timeGranularity: 'DAILY',
  points: []
};
