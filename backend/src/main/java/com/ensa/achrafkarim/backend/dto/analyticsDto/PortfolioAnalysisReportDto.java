package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioAnalysisReportDto {
    private LocalDateTime generatedAt;

    private PortfolioSummaryDto summary;
    private List<CategoryPortfolioDto> categoryBreakdown;
    private BCGMatrixDto bcgMatrix;
    private List<ProductPortfolioItemDto> allProducts;

    private PortfolioHealthDto portfolioHealth;
    private PortfolioDiversificationDto diversification;
    private List<PortfolioRiskDto> risks;
    private List<String> strategicRecommendations;
}