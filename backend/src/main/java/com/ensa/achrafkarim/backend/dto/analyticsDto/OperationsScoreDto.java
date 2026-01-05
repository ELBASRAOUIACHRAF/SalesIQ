package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OperationsScoreDto {
    private Double score;
    private String grade;
    private Double inventoryTurnover;
    private Long outOfStockCount;
    private Long lowStockCount;
    private Double stockHealthRate;
    private Double avgFulfillmentTime;
    private Double orderCompletionRate;
}