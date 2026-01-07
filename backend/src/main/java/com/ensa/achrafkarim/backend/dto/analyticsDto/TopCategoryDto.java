package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopCategoryDto {
    private Long categoryId;
    private String categoryName;
    private Double revenue;
    private Long productsSold;
    private Integer rank;
    private Double revenueShare;
}