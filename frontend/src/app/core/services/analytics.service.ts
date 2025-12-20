import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SeasonalityAnalysisDto } from '../models/seasonality.model';
import { CohortAnalysisDto, defaultCohortAnalysis } from '../models/cohort.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private readonly API_URL = 'http://localhost:8080/api/analytics';

  constructor(private http: HttpClient) {}

  analyzeSeasonality(start: string, end: string): Observable<SeasonalityAnalysisDto> {
    // Backend returns a LIST of SeasonalityAnalysisDto; pick the first item
    return this.http.get<SeasonalityAnalysisDto[]>(
      `${this.API_URL}/seasonality`,
      { params: { startDate: start, endDate: end } }
    ).pipe(
      map(list => {
        const fallback: SeasonalityAnalysisDto = {
          originalSeries: [],
          trendSeries: [],
          seasonalSeries: [],
          residualSeries: [],
          seasonalityType: 'NONE',
          seasonalityStrength: 0
        };
        return (Array.isArray(list) && list.length) ? list[0] : fallback;
      })
    );
  }

  getCohortAnalysis(start: string, end: string): Observable<CohortAnalysisDto> {
    return this.http.get<CohortAnalysisDto | null>(
      `${this.API_URL}/cohorts`,
      { params: { startDate: start, endDate: end } }
    ).pipe(
      map(res => res ?? defaultCohortAnalysis)
    );
  }
}
