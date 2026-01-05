package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductVarianceDto {
    private Double targetAvgRating;
    private Double actualAvgRating;
    private Double ratingVariance;
    private Long targetReviews;
    private Long actualReviews;
    private Long reviewsVariance;
    private Double reviewsVariancePercent;
    private Long targetActiveProducts;
    private Long actualActiveProducts;
    private Long activeProductsVariance;
}