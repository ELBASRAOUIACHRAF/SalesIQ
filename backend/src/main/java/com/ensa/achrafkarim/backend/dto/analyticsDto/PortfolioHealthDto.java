package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioHealthDto {
    private Double overallScore;
    private String healthStatus;
    private Double revenueConcentration;
    private Double productSuccessRate;
    private Double avgProductLifespan;
    private Double inventoryTurnover;
    private Double portfolioGrowthRate;
}