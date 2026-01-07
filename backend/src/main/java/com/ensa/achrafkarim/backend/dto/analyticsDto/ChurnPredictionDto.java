package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChurnPredictionDto {
    private Long userId;
    private Double churnProbability;
    private String riskLevel;
    private Integer daysSinceLastPurchase;
    private Integer totalPurchases;
    private Double totalSpent;
}