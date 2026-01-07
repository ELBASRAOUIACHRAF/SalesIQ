package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueBreakdownDto {
    private Double totalRevenue;
    private Double avgDailyRevenue;
    private Double maxDailyRevenue;
    private Double minDailyRevenue;
    private Long totalTransactions;
    private Double revenuePerTransaction;
}