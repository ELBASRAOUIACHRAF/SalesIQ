package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VarianceAlertDto {
    private String metric;
    private String severity;
    private Double targetValue;
    private Double actualValue;
    private Double variancePercent;
    private String message;
}