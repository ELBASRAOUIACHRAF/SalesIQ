package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Month;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyVarianceDto {
    private Integer year;
    private Integer month;
    private String monthName;
    private Double targetRevenue;
    private Double actualRevenue;
    private Double variance;
    private Double variancePercent;
    private String status;
}