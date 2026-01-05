package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueVarianceDto {
    private Double targetRevenue;
    private Double actualRevenue;
    private Double variance;
    private Double variancePercent;
    private String status;
    private Double previousPeriodRevenue;
    private Double growthTarget;
    private Double actualGrowth;
    private Double growthVariance;
}