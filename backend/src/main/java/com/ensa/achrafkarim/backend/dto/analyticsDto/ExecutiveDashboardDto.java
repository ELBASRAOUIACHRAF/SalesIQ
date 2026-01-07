package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExecutiveDashboardDto {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime generatedAt;

    private DashboardKPIsDto kpis;
    private PeriodComparisonDto periodComparison;

    private List<TopProductDto> topProducts;
    private List<TopCategoryDto> topCategories;
    private List<TopCustomerDto> topCustomers;

    private RevenueBreakdownDto revenueBreakdown;
    private CustomerMetricsDto customerMetrics;
    private InventoryMetricsDto inventoryMetrics;

    private Double healthScore;
    private String healthStatus;
    private List<String> alerts;
}