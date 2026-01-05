package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PerformanceScorecardDto {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime generatedAt;

    private Double overallScore;
    private String overallGrade;

    private FinancialScoreDto financialScore;
    private CustomerScoreDto customerScore;
    private OperationsScoreDto operationsScore;
    private ProductScoreDto productScore;

    private List<KPIItemDto> keyMetrics;
    private List<ScoreHistoryDto> scoreHistory;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> actionItems;
}