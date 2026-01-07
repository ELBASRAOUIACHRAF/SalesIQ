package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SalesVarianceDto {
    private Long targetOrders;
    private Long actualOrders;
    private Long orderVariance;
    private Double orderVariancePercent;
    private Long targetUnitsSold;
    private Long actualUnitsSold;
    private Long unitsVariance;
    private Double unitsVariancePercent;
    private Double targetAOV;
    private Double actualAOV;
    private Double aovVariance;
    private Double aovVariancePercent;
}