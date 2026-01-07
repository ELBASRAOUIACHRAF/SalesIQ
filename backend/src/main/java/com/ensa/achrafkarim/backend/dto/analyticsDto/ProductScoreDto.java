package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductScoreDto {
    private Double score;
    private String grade;
    private Long totalProducts;
    private Long activeProducts;
    private Double avgProductRating;
    private Double positiveReviewRate;
    private Long topPerformersCount;
    private Long underperformersCount;
}