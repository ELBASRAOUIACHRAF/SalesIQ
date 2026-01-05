package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VarianceAnalysisDto {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime generatedAt;

    private RevenueVarianceDto revenueVariance;
    private SalesVarianceDto salesVariance;
    private CustomerVarianceDto customerVariance;
    private ProductVarianceDto productVariance;

    private List<CategoryVarianceDto> categoryVariances;
    private List<MonthlyVarianceDto> monthlyVariances;

    private Double overallVarianceScore;
    private String performanceStatus;
    private List<VarianceAlertDto> alerts;
    private List<String> recommendations;
}