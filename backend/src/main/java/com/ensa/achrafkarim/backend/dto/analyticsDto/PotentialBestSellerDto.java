package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PotentialBestSellerDto {
    private Long productId;
    private String productName;
    private String categoryName;
    private Double currentSales;
    private Double salesGrowthRate;
    private Double potentialScore;
    private String potentialLevel;
    private Integer totalReviews;
    private Double avgRating;
    private Integer daysOnMarket;
}