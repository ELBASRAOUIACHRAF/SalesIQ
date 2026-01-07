package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductPerformanceDto {
    private Double revenueShare;
    private Double categoryRevenueShare;
    private Double conversionRate;
    private Double returnRate;
    private Double profitMargin;
    private String lifecycleStage;
}