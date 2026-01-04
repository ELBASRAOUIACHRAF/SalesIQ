package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnomalyDetectionDto {
    private LocalDate date;
    private Double salesValue;
    private Double expectedValue;
    private Double deviation;
    private Double zScore;
    private String anomalyType;
    private String severity;
    private Boolean isAnomaly;
}