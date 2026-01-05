package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryVarianceDto {
    private Long categoryId;
    private String categoryName;
    private Double targetRevenue;
    private Double actualRevenue;
    private Double variance;
    private Double variancePercent;
    private String status;
}