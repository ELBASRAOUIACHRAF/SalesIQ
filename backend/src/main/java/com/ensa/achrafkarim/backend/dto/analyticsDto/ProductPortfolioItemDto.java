package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductPortfolioItemDto {
    private Long productId;
    private String productName;
    private String categoryName;
    private Double price;
    private Double revenue;
    private Double revenueShare;
    private Long unitsSold;
    private Double avgRating;
    private Long stock;
    private Double growthRate;
    private String bcgQuadrant;
    private String abcClass;
    private String status;
}