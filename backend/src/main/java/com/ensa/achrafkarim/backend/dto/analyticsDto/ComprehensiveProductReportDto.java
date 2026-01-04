package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ComprehensiveProductReportDto {
    private Long productId;
    private String productName;
    private String categoryName;
    private LocalDateTime generatedAt;

    private ProductBasicInfoDto basicInfo;
    private ProductSalesMetricsDto salesMetrics;
    private ProductReviewMetricsDto reviewMetrics;
    private ProductInventoryStatusDto inventoryStatus;
    private ProductPerformanceDto performance;
    private List<DailySalesDto> salesHistory;
    private List<ProductCompetitorDto> categoryCompetitors;

    private Double overallScore;
    private String performanceLevel;
    private List<String> recommendations;
}