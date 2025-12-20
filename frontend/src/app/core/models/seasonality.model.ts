export type SeasonalityType = 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'NONE';

export interface TimeSeriesPointDto {
  timestamp: string; // ISO string from backend LocalDateTime
  value: number;
}

export interface SeasonalityAnalysisDto {
  originalSeries: TimeSeriesPointDto[];
  trendSeries: TimeSeriesPointDto[];
  seasonalSeries: TimeSeriesPointDto[];
  residualSeries: TimeSeriesPointDto[];
  seasonalityType: SeasonalityType;
  seasonalityStrength: number;
}
