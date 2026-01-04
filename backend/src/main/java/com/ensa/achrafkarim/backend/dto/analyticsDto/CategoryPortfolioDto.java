package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryPortfolioDto {
    private Long categoryId;
    private String categoryName;
    private Long productCount;
    private Double totalRevenue;
    private Double revenueShare;
    private Double avgProductPrice;
    private Double avgProductRating;
    private Long totalUnitsSold;
    private Double growthRate;
    private String performanceLevel;
}