package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioSummaryDto {
    private Long totalProducts;
    private Long activeProducts;
    private Long inactiveProducts;
    private Long totalCategories;
    private Double totalRevenue;
    private Double totalInventoryValue;
    private Long totalUnitsSold;
    private Double avgProductRevenue;
    private Double avgProductRating;
    private Double avgProductPrice;
}