package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PromotionImpactAnalysisDto {
    private double averageDiscount;
    private Long totalUnitsSold;
    private Double totalRevenue;
}