package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfitMarginAnalysisDto {

    private Long productId;
    private String productName;
    private Double totalRevenue;
    private Double totalCost;
    private Double profit;
    private Double profitMargin; // %
}
