package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RankingPredictionDto {
    private Long productId;
    private String productName;
    private Integer currentRank;
    private Integer predictedRank;
    private Double currentSales;
    private Double predictedSales;
    private String trend;
    private Integer daysAhead;
}