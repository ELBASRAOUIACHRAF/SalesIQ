package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductSalesMetricsDto {
    private Double totalRevenue;
    private Long totalUnitsSold;
    private Long totalOrders;
    private Double avgUnitsPerOrder;
    private Double avgRevenuePerOrder;
    private Double revenueLastWeek;
    private Double revenueLastMonth;
    private Double salesGrowthRate;
    private Integer categoryRank;
    private Integer overallRank;
}