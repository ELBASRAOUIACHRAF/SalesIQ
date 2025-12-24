package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryPerformanceDto {

    private Long categoryId;
    private String categoryName;
    private Long totalQuantitySold;
    private Double totalRevenue;
    private Long totalSales;
}
