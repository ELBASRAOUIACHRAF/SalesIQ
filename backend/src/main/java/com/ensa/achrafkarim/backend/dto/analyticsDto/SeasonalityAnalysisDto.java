package com.ensa.achrafkarim.backend.dto.analyticsDto;

import com.ensa.achrafkarim.backend.enums.analyticsEnum.SeasonalityType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeasonalityAnalysisDto {
    private List<TimeSeriesPointDto> originalSeries;
    private List<TimeSeriesPointDto> trendSeries;
    private List<TimeSeriesPointDto> seasonalSeries;
    private List<TimeSeriesPointDto> residualSeries;

    private SeasonalityType seasonalityType;
    private double seasonalityStrength;
}
