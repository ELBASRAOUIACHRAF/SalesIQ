package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FinancialScoreDto {
    private Double score;
    private String grade;
    private Double totalRevenue;
    private Double revenueGrowth;
    private Double avgOrderValue;
    private Double revenuePerCustomer;
    private Double targetRevenue;
    private Double targetAchievement;
}