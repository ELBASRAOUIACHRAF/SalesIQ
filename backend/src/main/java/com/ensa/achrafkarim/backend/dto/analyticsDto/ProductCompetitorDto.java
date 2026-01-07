package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductCompetitorDto {
    private Long productId;
    private String productName;
    private Double price;
    private Double revenue;
    private Double avgRating;
    private Long totalSold;
    private Integer rank;
}