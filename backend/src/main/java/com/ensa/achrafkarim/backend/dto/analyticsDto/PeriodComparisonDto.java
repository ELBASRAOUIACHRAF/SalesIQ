package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PeriodComparisonDto {
    private LocalDateTime period1Start;
    private LocalDateTime period1End;
    private LocalDateTime period2Start;
    private LocalDateTime period2End;

    private Double period1Revenue;
    private Double period2Revenue;
    private Double revenueChange;
    private Double revenueChangePercent;

    private Long period1Orders;
    private Long period2Orders;
    private Long ordersChange;
    private Double ordersChangePercent;

    private Long period1Customers;
    private Long period2Customers;
    private Long customersChange;
    private Double customersChangePercent;

    private Long period1ProductsSold;
    private Long period2ProductsSold;
    private Long productsSoldChange;
    private Double productsSoldChangePercent;

    private Double period1AvgOrderValue;
    private Double period2AvgOrderValue;
    private Double avgOrderValueChange;
    private Double avgOrderValueChangePercent;

    private String overallTrend;
}