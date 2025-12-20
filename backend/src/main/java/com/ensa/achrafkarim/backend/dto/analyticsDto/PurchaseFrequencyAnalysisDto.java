package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseFrequencyAnalysisDto {

    private Long userId;
    private String username;
    private Long totalSales;
    private Double averageSalesPerMonth;
}
