package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChurnInputDto {
    private Long userId;
    private Integer daysSinceLastPurchase;
    private Integer totalPurchases;
    private Double totalSpent;
    private Double avgOrderValue;
    private Integer purchaseFrequency;
}