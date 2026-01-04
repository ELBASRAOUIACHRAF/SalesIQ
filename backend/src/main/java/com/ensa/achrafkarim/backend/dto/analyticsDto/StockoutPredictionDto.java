package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockoutPredictionDto {
    private Long productId;
    private String productName;
    private Long currentStock;
    private Double avgDailySales;
    private Integer daysUntilStockout;
    private Double stockoutProbability;
    private String riskLevel;
    private Double predictedDemand;
    private Long recommendedRestock;
}