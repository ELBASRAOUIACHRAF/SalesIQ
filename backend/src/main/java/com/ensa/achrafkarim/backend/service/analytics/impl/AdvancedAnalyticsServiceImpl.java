package com.ensa.achrafkarim.backend.service.analytics.impl;

import com.ensa.achrafkarim.backend.dto.*;
import com.ensa.achrafkarim.backend.dto.analyticsDto.*;
import com.ensa.achrafkarim.backend.entities.Product;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.entities.SoldProduct;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.Role;
import com.ensa.achrafkarim.backend.enums.Segment;
import com.ensa.achrafkarim.backend.enums.analyticsEnum.ProductLifecyclePhase;
import com.ensa.achrafkarim.backend.enums.analyticsEnum.SeasonalityType;
import com.ensa.achrafkarim.backend.enums.analyticsEnum.TimeGranularity;
import com.ensa.achrafkarim.backend.mapper.SaleMapper;
import com.ensa.achrafkarim.backend.repository.*;
import com.ensa.achrafkarim.backend.service.*;
import com.ensa.achrafkarim.backend.service.analytics.AdvancedAnalyticsService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

import com.ensa.achrafkarim.backend.client.FastApiClient;  // ← ADD THIS
import org.springframework.web.client.RestTemplate;

@Service
@Transactional
@Data
@AllArgsConstructor
public class AdvancedAnalyticsServiceImpl implements AdvancedAnalyticsService {

    private final SaleRepository saleRepository;

    private final UsersRepository usersRepository;
    private final SaleMapper saleMapper;
    private final ProductRepository productRepository;
    private final SoldProductRepository soldProductRepository;
    private ReviewsRepository reviewsRepository;
    UsersService  usersService;
    SaleService  saleService;
    ReviewsService  reviewsService;
    SearchHistoryService searchHistoryService;
    SoldProductService  soldProductService;
    ProductService  productService;

    private final FastApiClient fastApiClient;
    private final RestTemplate restTemplate;// ← ADD THIS

    private final UsersServiceImpl usersServiceImpl;


    @Override
    public PortfolioAnalysisReportDto generatePortfolioReport() {
        PortfolioSummaryDto summary = buildPortfolioSummary();
        List<CategoryPortfolioDto> categoryBreakdown = buildCategoryBreakdown(summary.getTotalRevenue());
        List<ProductPortfolioItemDto> allProducts = buildAllProductsPortfolio(summary.getTotalRevenue());
        BCGMatrixDto bcgMatrix = buildBCGMatrix(allProducts);
        PortfolioHealthDto portfolioHealth = buildPortfolioHealth(summary, allProducts, bcgMatrix);
        PortfolioDiversificationDto diversification = buildDiversification(summary, categoryBreakdown);
        List<PortfolioRiskDto> risks = identifyRisks(summary, allProducts, bcgMatrix, categoryBreakdown);
        List<String> recommendations = generateStrategicRecommendations(summary, bcgMatrix, portfolioHealth, risks);

        return new PortfolioAnalysisReportDto(
                LocalDateTime.now(),
                summary,
                categoryBreakdown,
                bcgMatrix,
                allProducts,
                portfolioHealth,
                diversification,
                risks,
                recommendations
        );
    }

    private PortfolioSummaryDto buildPortfolioSummary() {
        Object[] metrics = productRepository.findPortfolioSummaryMetrics();
        Long totalCategories = productRepository.countCategories();

        Long totalProducts = metrics[0] != null ? ((Number) metrics[0]).longValue() : 0L;
        Long activeProducts = metrics[1] != null ? ((Number) metrics[1]).longValue() : 0L;
        Long inactiveProducts = metrics[2] != null ? ((Number) metrics[2]).longValue() : 0L;
        Double avgPrice = metrics[3] != null ? ((Number) metrics[3]).doubleValue() : 0.0;
        Double totalInventoryValue = metrics[6] != null ? ((Number) metrics[6]).doubleValue() : 0.0;

        List<Object[]> productsData = soldProductRepository.findAllProductsPortfolioData();

        Double totalRevenue = productsData.stream()
                .filter(row -> row[4] != null)
                .mapToDouble(row -> ((Number) row[4]).doubleValue())
                .sum();

        Long totalUnitsSold = productsData.stream()
                .filter(row -> row[5] != null)
                .mapToLong(row -> ((Number) row[5]).longValue())
                .sum();

        Double avgRating = productsData.stream()
                .filter(row -> row[6] != null)
                .mapToDouble(row -> ((Number) row[6]).doubleValue())
                .average()
                .orElse(0.0);

        Double avgProductRevenue = totalProducts > 0 ? totalRevenue / totalProducts : 0.0;

        return new PortfolioSummaryDto(
                totalProducts,
                activeProducts,
                inactiveProducts,
                totalCategories,
                totalRevenue,
                totalInventoryValue,
                totalUnitsSold,
                avgProductRevenue,
                avgRating,
                avgPrice
        );
    }

    private List<CategoryPortfolioDto> buildCategoryBreakdown(Double totalRevenue) {
        List<Object[]> categoryData = soldProductRepository.findCategoryPortfolioData();

        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        LocalDateTime twoMonthsAgo = LocalDateTime.now().minusMonths(2);

        Map<Long, Double> currentMonthRevenue = soldProductRepository.findCategoryRevenueSince(oneMonthAgo)
                .stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(),
                        row -> ((Number) row[1]).doubleValue()
                ));

        Map<Long, Double> previousMonthRevenue = soldProductRepository.findCategoryRevenueSince(twoMonthsAgo)
                .stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(),
                        row -> ((Number) row[1]).doubleValue()
                ));

        return categoryData.stream()
                .map(row -> {
                    Long categoryId = ((Number) row[0]).longValue();
                    String categoryName = (String) row[1];
                    Long productCount = ((Number) row[2]).longValue();
                    Double revenue = row[3] != null ? ((Number) row[3]).doubleValue() : 0.0;
                    Double avgPrice = row[4] != null ? ((Number) row[4]).doubleValue() : 0.0;
                    Double avgRating = row[5] != null ? ((Number) row[5]).doubleValue() : 0.0;
                    Long unitsSold = row[6] != null ? ((Number) row[6]).longValue() : 0L;

                    Double revenueShare = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0.0;

                    Double currentRev = currentMonthRevenue.getOrDefault(categoryId, 0.0);
                    Double prevRev = previousMonthRevenue.getOrDefault(categoryId, 0.0) - currentRev;
                    Double growthRate = prevRev > 0 ? ((currentRev - prevRev) / prevRev) * 100 : 0.0;

                    String performanceLevel = determinePerformanceLevel(revenueShare, growthRate);

                    return new CategoryPortfolioDto(
                            categoryId,
                            categoryName,
                            productCount,
                            revenue,
                            revenueShare,
                            avgPrice,
                            avgRating,
                            unitsSold,
                            growthRate,
                            performanceLevel
                    );
                })
                .toList();
    }

    private String determinePerformanceLevel(Double revenueShare, Double growthRate) {
        if (revenueShare > 20 && growthRate > 10) return "EXCELLENT";
        if (revenueShare > 10 || growthRate > 20) return "GOOD";
        if (revenueShare > 5 || growthRate > 0) return "AVERAGE";
        return "POOR";
    }

    private List<ProductPortfolioItemDto> buildAllProductsPortfolio(Double totalRevenue) {
        List<Object[]> productsData = soldProductRepository.findAllProductsPortfolioData();

        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        LocalDateTime twoMonthsAgo = LocalDateTime.now().minusMonths(2);

        Map<Long, Double> currentMonthRevenue = soldProductRepository.findProductRevenueSince(oneMonthAgo)
                .stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(),
                        row -> ((Number) row[1]).doubleValue()
                ));

        Map<Long, Double> previousMonthRevenue = soldProductRepository.findProductRevenueSince(twoMonthsAgo)
                .stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(),
                        row -> ((Number) row[1]).doubleValue()
                ));

        double cumulativeRevenue = 0.0;

        List<ProductPortfolioItemDto> products = new ArrayList<>();

        for (Object[] row : productsData) {
            Long productId = ((Number) row[0]).longValue();
            String productName = (String) row[1];
            String categoryName = row[2] != null ? (String) row[2] : "Uncategorized";
            Double price = row[3] != null ? ((Number) row[3]).doubleValue() : 0.0;
            Double revenue = row[4] != null ? ((Number) row[4]).doubleValue() : 0.0;
            Long unitsSold = row[5] != null ? ((Number) row[5]).longValue() : 0L;
            Double avgRating = row[6] != null ? ((Number) row[6]).doubleValue() : 0.0;
            Long stock = row[7] != null ? ((Number) row[7]).longValue() : 0L;
            Boolean isActive = row[8] != null ? (Boolean) row[8] : false;

            Double revenueShare = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0.0;

            Double currentRev = currentMonthRevenue.getOrDefault(productId, 0.0);
            Double prevRev = previousMonthRevenue.getOrDefault(productId, 0.0) - currentRev;
            Double growthRate = prevRev > 0 ? ((currentRev - prevRev) / prevRev) * 100 : 0.0;

            cumulativeRevenue += revenue;
            Double cumulativeShare = totalRevenue > 0 ? (cumulativeRevenue / totalRevenue) * 100 : 0.0;

            String abcClass;
            if (cumulativeShare <= 80) abcClass = "A";
            else if (cumulativeShare <= 95) abcClass = "B";
            else abcClass = "C";

            String bcgQuadrant = determineBCGQuadrant(revenueShare, growthRate);

            String status = isActive ? "ACTIVE" : "INACTIVE";

            products.add(new ProductPortfolioItemDto(
                    productId,
                    productName,
                    categoryName,
                    price,
                    revenue,
                    revenueShare,
                    unitsSold,
                    avgRating,
                    stock,
                    growthRate,
                    bcgQuadrant,
                    abcClass,
                    status
            ));
        }

        return products;
    }

    private String determineBCGQuadrant(Double marketShare, Double growthRate) {
        boolean highShare = marketShare > 5;
        boolean highGrowth = growthRate > 10;

        if (highShare && highGrowth) return "STAR";
        if (highShare && !highGrowth) return "CASH_COW";
        if (!highShare && highGrowth) return "QUESTION_MARK";
        return "DOG";
    }

    private BCGMatrixDto buildBCGMatrix(List<ProductPortfolioItemDto> allProducts) {
        List<BCGProductDto> stars = new ArrayList<>();
        List<BCGProductDto> cashCows = new ArrayList<>();
        List<BCGProductDto> questionMarks = new ArrayList<>();
        List<BCGProductDto> dogs = new ArrayList<>();

        for (ProductPortfolioItemDto product : allProducts) {
            BCGProductDto bcgProduct = new BCGProductDto(
                    product.getProductId(),
                    product.getProductName(),
                    product.getCategoryName(),
                    product.getRevenueShare(),
                    product.getGrowthRate(),
                    product.getRevenue(),
                    product.getBcgQuadrant()
            );

            switch (product.getBcgQuadrant()) {
                case "STAR" -> stars.add(bcgProduct);
                case "CASH_COW" -> cashCows.add(bcgProduct);
                case "QUESTION_MARK" -> questionMarks.add(bcgProduct);
                case "DOG" -> dogs.add(bcgProduct);
            }
        }

        return new BCGMatrixDto(
                stars,
                cashCows,
                questionMarks,
                dogs,
                stars.size(),
                cashCows.size(),
                questionMarks.size(),
                dogs.size()
        );
    }

    private PortfolioHealthDto buildPortfolioHealth(PortfolioSummaryDto summary,
                                                    List<ProductPortfolioItemDto> allProducts,
                                                    BCGMatrixDto bcgMatrix) {
        Double revenueConcentration = calculateRevenueConcentration(allProducts);

        long productsWithSales = allProducts.stream()
                .filter(p -> p.getRevenue() > 0)
                .count();
        Double productSuccessRate = summary.getTotalProducts() > 0
                ? ((double) productsWithSales / summary.getTotalProducts()) * 100
                : 0.0;

        Double avgProductLifespan = 180.0;

        Double inventoryTurnover = summary.getTotalInventoryValue() > 0
                ? summary.getTotalRevenue() / summary.getTotalInventoryValue()
                : 0.0;

        Double portfolioGrowthRate = allProducts.stream()
                .mapToDouble(ProductPortfolioItemDto::getGrowthRate)
                .average()
                .orElse(0.0);

        Double overallScore = calculatePortfolioHealthScore(
                revenueConcentration,
                productSuccessRate,
                inventoryTurnover,
                portfolioGrowthRate,
                bcgMatrix
        );

        String healthStatus = determineHealthStatus(overallScore);

        return new PortfolioHealthDto(
                overallScore,
                healthStatus,
                revenueConcentration,
                productSuccessRate,
                avgProductLifespan,
                inventoryTurnover,
                portfolioGrowthRate
        );
    }

    private Double calculateRevenueConcentration(List<ProductPortfolioItemDto> products) {
        if (products.isEmpty()) return 0.0;

        double top20Percent = Math.ceil(products.size() * 0.2);
        double top20Revenue = products.stream()
                .limit((long) top20Percent)
                .mapToDouble(ProductPortfolioItemDto::getRevenue)
                .sum();

        double totalRevenue = products.stream()
                .mapToDouble(ProductPortfolioItemDto::getRevenue)
                .sum();

        return totalRevenue > 0 ? (top20Revenue / totalRevenue) * 100 : 0.0;
    }

    private Double calculatePortfolioHealthScore(Double revenueConcentration, Double productSuccessRate,
                                                 Double inventoryTurnover, Double growthRate, BCGMatrixDto bcg) {
        double score = 50.0;

        if (revenueConcentration < 60) score += 10;
        else if (revenueConcentration > 90) score -= 15;

        if (productSuccessRate > 80) score += 15;
        else if (productSuccessRate > 60) score += 10;
        else if (productSuccessRate < 40) score -= 10;

        if (inventoryTurnover > 4) score += 10;
        else if (inventoryTurnover > 2) score += 5;
        else if (inventoryTurnover < 1) score -= 10;

        if (growthRate > 15) score += 10;
        else if (growthRate > 0) score += 5;
        else if (growthRate < -10) score -= 15;

        int totalProducts = bcg.getStarsCount() + bcg.getCashCowsCount() + bcg.getQuestionMarksCount() + bcg.getDogsCount();
        if (totalProducts > 0) {
            double starsRatio = (double) bcg.getStarsCount() / totalProducts;
            double dogsRatio = (double) bcg.getDogsCount() / totalProducts;

            if (starsRatio > 0.2) score += 10;
            if (dogsRatio > 0.5) score -= 15;
        }

        return Math.max(0, Math.min(100, score));
    }

    private String determineHealthStatus(Double score) {
        if (score >= 80) return "EXCELLENT";
        if (score >= 60) return "GOOD";
        if (score >= 40) return "FAIR";
        if (score >= 20) return "POOR";
        return "CRITICAL";
    }

    private PortfolioDiversificationDto buildDiversification(PortfolioSummaryDto summary,
                                                             List<CategoryPortfolioDto> categories) {
        Object[] priceMetrics = productRepository.findPortfolioSummaryMetrics();

        Double minPrice = priceMetrics[4] != null ? ((Number) priceMetrics[4]).doubleValue() : 0.0;
        Double maxPrice = priceMetrics[5] != null ? ((Number) priceMetrics[5]).doubleValue() : 0.0;
        Double avgPrice = summary.getAvgProductPrice();

        Double priceRangeSpread = maxPrice > 0 ? ((maxPrice - minPrice) / maxPrice) * 100 : 0.0;

        Double categoryConcentration = 0.0;
        if (!categories.isEmpty()) {
            Double topCategoryShare = categories.get(0).getRevenueShare();
            categoryConcentration = topCategoryShare;
        }

        String diversificationLevel;
        if (categories.size() >= 5 && categoryConcentration < 40 && priceRangeSpread > 50) {
            diversificationLevel = "HIGH";
        } else if (categories.size() >= 3 && categoryConcentration < 60) {
            diversificationLevel = "MEDIUM";
        } else {
            diversificationLevel = "LOW";
        }

        return new PortfolioDiversificationDto(
                categories.size(),
                categoryConcentration,
                priceRangeSpread,
                minPrice,
                maxPrice,
                avgPrice,
                diversificationLevel
        );
    }

    private List<PortfolioRiskDto> identifyRisks(PortfolioSummaryDto summary,
                                                 List<ProductPortfolioItemDto> products,
                                                 BCGMatrixDto bcg,
                                                 List<CategoryPortfolioDto> categories) {
        List<PortfolioRiskDto> risks = new ArrayList<>();

        int totalProducts = bcg.getStarsCount() + bcg.getCashCowsCount() + bcg.getQuestionMarksCount() + bcg.getDogsCount();
        if (totalProducts > 0 && (double) bcg.getDogsCount() / totalProducts > 0.5) {
            risks.add(new PortfolioRiskDto(
                    "HIGH_DOG_RATIO",
                    "HIGH",
                    "More than 50% of products are in the DOG quadrant with low growth and low market share",
                    "Consider discontinuing underperforming products or investing in repositioning"
            ));
        }

        long outOfStock = products.stream().filter(p -> p.getStock() == 0).count();
        if (outOfStock > 0) {
            risks.add(new PortfolioRiskDto(
                    "STOCK_SHORTAGE",
                    outOfStock > 5 ? "HIGH" : "MEDIUM",
                    outOfStock + " products are currently out of stock",
                    "Urgent restocking required for out-of-stock items"
            ));
        }

        if (!categories.isEmpty() && categories.get(0).getRevenueShare() > 70) {
            risks.add(new PortfolioRiskDto(
                    "CATEGORY_CONCENTRATION",
                    "HIGH",
                    "Over 70% of revenue comes from a single category",
                    "Diversify product portfolio across more categories"
            ));
        }

        long lowRatedProducts = products.stream().filter(p -> p.getAvgRating() > 0 && p.getAvgRating() < 3).count();
        if (lowRatedProducts > 3) {
            risks.add(new PortfolioRiskDto(
                    "QUALITY_ISSUES",
                    "MEDIUM",
                    lowRatedProducts + " products have ratings below 3 stars",
                    "Investigate quality issues and customer complaints"
            ));
        }

        long decliningProducts = products.stream().filter(p -> p.getGrowthRate() < -20).count();
        if (decliningProducts > products.size() * 0.3) {
            risks.add(new PortfolioRiskDto(
                    "DECLINING_PORTFOLIO",
                    "HIGH",
                    "More than 30% of products have declining sales (>20% drop)",
                    "Review pricing strategy and marketing efforts"
            ));
        }

        if (summary.getActiveProducts() < summary.getTotalProducts() * 0.7) {
            risks.add(new PortfolioRiskDto(
                    "HIGH_INACTIVE_RATIO",
                    "MEDIUM",
                    "More than 30% of products are inactive",
                    "Review inactive products for potential reactivation or removal"
            ));
        }

        if (risks.isEmpty()) {
            risks.add(new PortfolioRiskDto(
                    "NO_MAJOR_RISKS",
                    "LOW",
                    "No significant portfolio risks identified",
                    "Continue monitoring key metrics"
            ));
        }

        return risks;
    }

    private List<String> generateStrategicRecommendations(PortfolioSummaryDto summary,
                                                          BCGMatrixDto bcg,
                                                          PortfolioHealthDto health,
                                                          List<PortfolioRiskDto> risks) {
        List<String> recommendations = new ArrayList<>();

        if (bcg.getStarsCount() > 0) {
            recommendations.add("INVEST: You have " + bcg.getStarsCount() + " STAR products. Prioritize investment to maintain their growth and market position.");
        }

        if (bcg.getCashCowsCount() > 0) {
            recommendations.add("HARVEST: " + bcg.getCashCowsCount() + " CASH COW products are generating stable revenue. Minimize investment and maximize cash flow.");
        }

        if (bcg.getQuestionMarksCount() > 0) {
            recommendations.add("EVALUATE: " + bcg.getQuestionMarksCount() + " QUESTION MARK products need strategic decision - invest to grow or divest.");
        }

        if (bcg.getDogsCount() > 5) {
            recommendations.add("DIVEST: Consider discontinuing some of the " + bcg.getDogsCount() + " DOG products to free up resources.");
        }

        if (health.getRevenueConcentration() > 80) {
            recommendations.add("DIVERSIFY: Revenue is highly concentrated. Develop new products to reduce dependency on top performers.");
        }

        if (health.getInventoryTurnover() < 2) {
            recommendations.add("OPTIMIZE INVENTORY: Low inventory turnover indicates excess stock. Review purchasing and pricing strategies.");
        }

        if (health.getProductSuccessRate() < 50) {
            recommendations.add("PRODUCT DEVELOPMENT: Less than 50% of products generate revenue. Improve product selection and market research.");
        }

        if (health.getPortfolioGrowthRate() < 0) {
            recommendations.add("GROWTH STRATEGY: Overall portfolio is declining. Invest in marketing and new product development.");
        }

        boolean hasHighRisk = risks.stream().anyMatch(r -> r.getSeverity().equals("HIGH"));
        if (hasHighRisk) {
            recommendations.add("RISK MITIGATION: Address high-severity risks identified in the portfolio analysis immediately.");
        }

        if (recommendations.isEmpty()) {
            recommendations.add("MAINTAIN: Portfolio is healthy. Continue current strategy with regular monitoring.");
        }

        return recommendations;
    }

    @Override
    public ComprehensiveProductReportDto generateProductReport(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        ProductBasicInfoDto basicInfo = buildBasicInfo(product);
        ProductSalesMetricsDto salesMetrics = buildSalesMetrics(productId, product);
        ProductReviewMetricsDto reviewMetrics = buildReviewMetrics(productId);
        ProductInventoryStatusDto inventoryStatus = buildInventoryStatus(product, productId);
        ProductPerformanceDto performance = buildPerformance(productId, product, salesMetrics);
        List<DailySalesDto> salesHistory = buildSalesHistory(productId);
        List<ProductCompetitorDto> competitors = buildCompetitors(product);

        Double overallScore = calculateProductScore(salesMetrics, reviewMetrics, inventoryStatus, performance);
        String performanceLevel = determinePerformanceLevel(overallScore);
        List<String> recommendations = generateRecommendations(salesMetrics, reviewMetrics, inventoryStatus, performance);

        return new ComprehensiveProductReportDto(
                productId,
                product.getName(),
                product.getCategory() != null ? product.getCategory().getName() : "Uncategorized",
                LocalDateTime.now(),
                basicInfo,
                salesMetrics,
                reviewMetrics,
                inventoryStatus,
                performance,
                salesHistory,
                competitors,
                overallScore,
                performanceLevel,
                recommendations
        );
    }

    private ProductBasicInfoDto buildBasicInfo(Product product) {
        int daysOnMarket = product.getCreatedAt() != null
                ? (int) java.time.temporal.ChronoUnit.DAYS.between(product.getCreatedAt(), LocalDateTime.now())
                : 0;

        return new ProductBasicInfoDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getMark(),
                product.getPrice(),
                product.getDiscount(),
                product.getCategory() != null ? product.getCategory().getName() : "Uncategorized",
                product.getImageUrl(),
                product.getIsActive(),
                product.getCreatedAt(),
                daysOnMarket
        );
    }

    private ProductSalesMetricsDto buildSalesMetrics(Long productId, Product product) {
        Object[] metrics = soldProductRepository.findProductSalesMetrics(productId);

        Double totalRevenue = metrics[0] != null ? ((Number) metrics[0]).doubleValue() : 0.0;
        Long totalUnitsSold = metrics[1] != null ? ((Number) metrics[1]).longValue() : 0L;
        Long totalOrders = metrics[2] != null ? ((Number) metrics[2]).longValue() : 0L;

        Double avgUnitsPerOrder = totalOrders > 0 ? (double) totalUnitsSold / totalOrders : 0.0;
        Double avgRevenuePerOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0.0;

        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        LocalDateTime twoMonthsAgo = LocalDateTime.now().minusMonths(2);

        Double revenueLastWeek = soldProductRepository.findProductRevenueSince(productId, oneWeekAgo);
        Double revenueLastMonth = soldProductRepository.findProductRevenueSince(productId, oneMonthAgo);
        Double revenuePreviousMonth = soldProductRepository.findProductRevenueSince(productId, twoMonthsAgo);

        revenueLastWeek = revenueLastWeek != null ? revenueLastWeek : 0.0;
        revenueLastMonth = revenueLastMonth != null ? revenueLastMonth : 0.0;
        Double previousMonthRevenue = revenuePreviousMonth != null ? revenuePreviousMonth - revenueLastMonth : 0.0;

        Double salesGrowthRate = previousMonthRevenue > 0
                ? ((revenueLastMonth - previousMonthRevenue) / previousMonthRevenue) * 100
                : 0.0;

        Integer overallRank = soldProductRepository.findOverallRank(productId);
        Integer categoryRank = 1;

        if (product.getCategory() != null) {
            List<Object[]> competitors = soldProductRepository.findCategoryCompetitors(product.getCategory().getId());
            for (int i = 0; i < competitors.size(); i++) {
                if (((Number) competitors.get(i)[0]).longValue() == productId) {
                    categoryRank = i + 1;
                    break;
                }
            }
        }

        return new ProductSalesMetricsDto(
                totalRevenue,
                totalUnitsSold,
                totalOrders,
                avgUnitsPerOrder,
                avgRevenuePerOrder,
                revenueLastWeek,
                revenueLastMonth,
                salesGrowthRate,
                categoryRank,
                overallRank != null ? overallRank : 1
        );
    }

    private ProductReviewMetricsDto buildReviewMetrics(Long productId) {
        Object[] metrics = reviewsRepository.findProductReviewMetrics(productId);

        Long totalReviews = metrics[0] != null ? ((Number) metrics[0]).longValue() : 0L;
        Double avgRating = metrics[1] != null ? ((Number) metrics[1]).doubleValue() : 0.0;
        LocalDateTime lastReviewDate = metrics[2] != null ? (LocalDateTime) metrics[2] : null;
        Long fiveStarCount = metrics[3] != null ? ((Number) metrics[3]).longValue() : 0L;
        Long fourStarCount = metrics[4] != null ? ((Number) metrics[4]).longValue() : 0L;
        Long threeStarCount = metrics[5] != null ? ((Number) metrics[5]).longValue() : 0L;
        Long twoStarCount = metrics[6] != null ? ((Number) metrics[6]).longValue() : 0L;
        Long oneStarCount = metrics[7] != null ? ((Number) metrics[7]).longValue() : 0L;

        Double positiveRatio = totalReviews > 0
                ? ((double) (fiveStarCount + fourStarCount) / totalReviews) * 100
                : 0.0;

        return new ProductReviewMetricsDto(
                totalReviews,
                avgRating,
                fiveStarCount,
                fourStarCount,
                threeStarCount,
                twoStarCount,
                oneStarCount,
                positiveRatio,
                lastReviewDate
        );
    }

    private ProductInventoryStatusDto buildInventoryStatus(Product product, Long productId) {
        Long currentStock = product.getStock() != null ? product.getStock() : 0L;

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Double avgDailySales = soldProductRepository.findAvgDailySales(productId, thirtyDaysAgo);
        avgDailySales = avgDailySales != null ? avgDailySales : 0.0;

        Integer daysUntilStockout = avgDailySales > 0 ? (int) (currentStock / avgDailySales) : 999;

        String stockStatus;
        if (currentStock == 0) {
            stockStatus = "OUT_OF_STOCK";
        } else if (daysUntilStockout <= 7) {
            stockStatus = "CRITICAL";
        } else if (daysUntilStockout <= 14) {
            stockStatus = "LOW";
        } else if (daysUntilStockout <= 30) {
            stockStatus = "MEDIUM";
        } else {
            stockStatus = "HEALTHY";
        }

        Long recommendedRestock = (long) Math.max(0, (avgDailySales * 30) - currentStock);
        Double inventoryValue = currentStock * product.getPrice();

        return new ProductInventoryStatusDto(
                currentStock,
                avgDailySales,
                daysUntilStockout,
                stockStatus,
                recommendedRestock,
                inventoryValue
        );
    }

    private ProductPerformanceDto buildPerformance(Long productId, Product product, ProductSalesMetricsDto salesMetrics) {
        Double totalRevenue = soldProductRepository.findTotalRevenue();
        totalRevenue = totalRevenue != null ? totalRevenue : 0.0;

        Double categoryRevenue = 0.0;
        if (product.getCategory() != null) {
            categoryRevenue = soldProductRepository.findCategoryTotalRevenue(product.getCategory().getId());
            categoryRevenue = categoryRevenue != null ? categoryRevenue : 0.0;
        }

        Double revenueShare = totalRevenue > 0 ? (salesMetrics.getTotalRevenue() / totalRevenue) * 100 : 0.0;
        Double categoryRevenueShare = categoryRevenue > 0 ? (salesMetrics.getTotalRevenue() / categoryRevenue) * 100 : 0.0;

        Double conversionRate = 5.0;
        Double returnRate = 2.0;
        Double profitMargin = product.getDiscount() > 0 ? (1 - product.getDiscount() / 100) * 30 : 30.0;

        String lifecycleStage = determineLifecycleStage(salesMetrics);

        return new ProductPerformanceDto(
                revenueShare,
                categoryRevenueShare,
                conversionRate,
                returnRate,
                profitMargin,
                lifecycleStage
        );
    }

    private String determineLifecycleStage(ProductSalesMetricsDto salesMetrics) {
        if (salesMetrics.getSalesGrowthRate() > 20) {
            return "GROWTH";
        } else if (salesMetrics.getSalesGrowthRate() > 0) {
            return "MATURITY";
        } else if (salesMetrics.getSalesGrowthRate() > -20) {
            return "SATURATION";
        } else {
            return "DECLINE";
        }
    }

    private List<DailySalesDto> buildSalesHistory(Long productId) {
        List<Object[]> history = soldProductRepository.findProductSalesHistory(productId);

        return history.stream()
                .map(row -> new DailySalesDto(
                        (LocalDate) row[0],
                        ((Number) row[1]).doubleValue()
                ))
                .toList();
    }

    private List<ProductCompetitorDto> buildCompetitors(Product product) {
        if (product.getCategory() == null) {
            return new ArrayList<>();
        }

        List<Object[]> competitors = soldProductRepository.findCategoryCompetitors(product.getCategory().getId());
        List<ProductCompetitorDto> result = new ArrayList<>();

        int rank = 1;
        for (Object[] row : competitors) {
            if (rank > 10) break;
            result.add(new ProductCompetitorDto(
                    ((Number) row[0]).longValue(),
                    (String) row[1],
                    row[2] != null ? ((Number) row[2]).doubleValue() : 0.0,
                    row[3] != null ? ((Number) row[3]).doubleValue() : 0.0,
                    row[4] != null ? ((Number) row[4]).doubleValue() : 0.0,
                    row[5] != null ? ((Number) row[5]).longValue() : 0L,
                    rank++
            ));
        }
        return result;
    }

    private Double calculateProductScore(ProductSalesMetricsDto sales, ProductReviewMetricsDto reviews,
                                         ProductInventoryStatusDto inventory, ProductPerformanceDto performance) {
        double score = 50.0;

        if (sales.getSalesGrowthRate() > 20) score += 15;
        else if (sales.getSalesGrowthRate() > 0) score += 10;
        else if (sales.getSalesGrowthRate() > -10) score -= 5;
        else score -= 15;

        if (reviews.getAvgRating() >= 4.5) score += 15;
        else if (reviews.getAvgRating() >= 4.0) score += 10;
        else if (reviews.getAvgRating() >= 3.5) score += 5;
        else if (reviews.getAvgRating() < 3.0) score -= 10;

        if (reviews.getTotalReviews() >= 50) score += 5;
        else if (reviews.getTotalReviews() >= 20) score += 3;

        switch (inventory.getStockStatus()) {
            case "HEALTHY" -> score += 10;
            case "MEDIUM" -> score += 5;
            case "LOW" -> score -= 5;
            case "CRITICAL" -> score -= 10;
            case "OUT_OF_STOCK" -> score -= 15;
        }

        if (performance.getCategoryRevenueShare() > 20) score += 5;
        else if (performance.getCategoryRevenueShare() > 10) score += 3;

        return Math.max(0, Math.min(100, score));
    }

    private String determinePerformanceLevel(Double score) {
        if (score >= 80) return "STAR";
        if (score >= 60) return "STRONG";
        if (score >= 40) return "AVERAGE";
        if (score >= 20) return "WEAK";
        return "CRITICAL";
    }

    private List<String> generateRecommendations(ProductSalesMetricsDto sales, ProductReviewMetricsDto reviews,
                                                 ProductInventoryStatusDto inventory, ProductPerformanceDto performance) {
        List<String> recommendations = new ArrayList<>();

        if (sales.getSalesGrowthRate() < -10) {
            recommendations.add("Sales are declining. Consider running promotions or adjusting pricing strategy.");
        }

        if (sales.getSalesGrowthRate() > 20 && inventory.getStockStatus().equals("LOW")) {
            recommendations.add("Product is growing fast but stock is low. Increase inventory to meet demand.");
        }

        if (reviews.getAvgRating() < 3.5) {
            recommendations.add("Product rating is below average. Investigate customer complaints and improve quality.");
        }

        if (reviews.getTotalReviews() < 10 && sales.getTotalUnitsSold() > 50) {
            recommendations.add("Low review count despite sales. Encourage customers to leave reviews.");
        }

        if (inventory.getStockStatus().equals("OUT_OF_STOCK")) {
            recommendations.add("URGENT: Product is out of stock. Restock immediately to avoid lost sales.");
        } else if (inventory.getStockStatus().equals("CRITICAL")) {
            recommendations.add("Stock levels are critical. Order " + inventory.getRecommendedRestock() + " units soon.");
        }

        if (performance.getLifecycleStage().equals("DECLINE")) {
            recommendations.add("Product is in decline phase. Consider discontinuing or repositioning.");
        }

        if (performance.getCategoryRevenueShare() < 5) {
            recommendations.add("Low market share in category. Increase marketing efforts or differentiate product.");
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Product is performing well. Maintain current strategy.");
        }

        return recommendations;
    }


    @Override
    public ExecutiveDashboardDto generateExecutiveDashboard(LocalDateTime startDate, LocalDateTime endDate) {
        DashboardKPIsDto kpis = calculateMainKPIs(startDate, endDate);

        long periodDays = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        LocalDateTime prevPeriodStart = startDate.minusDays(periodDays);
        LocalDateTime prevPeriodEnd = startDate.minusSeconds(1);
        PeriodComparisonDto periodComparison = comparePeriods(prevPeriodStart, prevPeriodEnd, startDate, endDate);

        List<TopProductDto> topProducts = getTopProducts(startDate, endDate, 10);
        List<TopCategoryDto> topCategories = getTopCategories(startDate, endDate, 5);
        List<TopCustomerDto> topCustomers = getTopCustomers(startDate, endDate, 10);

        RevenueBreakdownDto revenueBreakdown = getRevenueBreakdown(startDate, endDate, kpis);
        CustomerMetricsDto customerMetrics = getCustomerMetrics(startDate, endDate, kpis);
        InventoryMetricsDto inventoryMetrics = getInventoryMetrics();

        Double healthScore = calculateHealthScore(kpis, periodComparison, inventoryMetrics);
        String healthStatus = determineHealthStatus(healthScore);
        List<String> alerts = generateAlerts(kpis, periodComparison, inventoryMetrics);

        return new ExecutiveDashboardDto(
                startDate,
                endDate,
                LocalDateTime.now(),
                kpis,
                periodComparison,
                topProducts,
                topCategories,
                topCustomers,
                revenueBreakdown,
                customerMetrics,
                inventoryMetrics,
                healthScore,
                healthStatus,
                alerts
        );
    }

    private List<TopProductDto> getTopProducts(LocalDateTime startDate, LocalDateTime endDate, int limit) {
        List<Object[]> data = saleRepository.findTopProducts(startDate, endDate);
        List<TopProductDto> result = new ArrayList<>();

        int rank = 1;
        for (Object[] row : data) {
            if (rank > limit) break;
            result.add(new TopProductDto(
                    ((Number) row[0]).longValue(),
                    (String) row[1],
                    row[2] != null ? (String) row[2] : "Uncategorized",
                    ((Number) row[3]).doubleValue(),
                    ((Number) row[4]).longValue(),
                    rank++
            ));
        }
        return result;
    }

    private List<TopCategoryDto> getTopCategories(LocalDateTime startDate, LocalDateTime endDate, int limit) {
        List<Object[]> data = saleRepository.findTopCategories(startDate, endDate);
        List<TopCategoryDto> result = new ArrayList<>();

        Double totalRevenue = data.stream()
                .mapToDouble(row -> ((Number) row[2]).doubleValue())
                .sum();

        int rank = 1;
        for (Object[] row : data) {
            if (rank > limit) break;
            Double revenue = ((Number) row[2]).doubleValue();
            result.add(new TopCategoryDto(
                    ((Number) row[0]).longValue(),
                    (String) row[1],
                    revenue,
                    ((Number) row[3]).longValue(),
                    rank++,
                    totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0.0
            ));
        }
        return result;
    }

    private List<TopCustomerDto> getTopCustomers(LocalDateTime startDate, LocalDateTime endDate, int limit) {
        List<Object[]> data = saleRepository.findTopCustomers(startDate, endDate);
        List<TopCustomerDto> result = new ArrayList<>();

        int rank = 1;
        for (Object[] row : data) {
            if (rank > limit) break;
            result.add(new TopCustomerDto(
                    ((Number) row[0]).longValue(),
                    (String) row[1],
                    (String) row[2],
                    ((Number) row[3]).doubleValue(),
                    ((Number) row[4]).longValue(),
                    rank++
            ));
        }
        return result;
    }

    private RevenueBreakdownDto getRevenueBreakdown(LocalDateTime startDate, LocalDateTime endDate, DashboardKPIsDto kpis) {
        Object[] stats = saleRepository.calculateRevenueStats(startDate, endDate);

        Double avgDaily = stats[0] != null ? ((Number) stats[0]).doubleValue() : 0.0;
        Double maxDaily = stats[1] != null ? ((Number) stats[1]).doubleValue() : 0.0;
        Double minDaily = stats[2] != null ? ((Number) stats[2]).doubleValue() : 0.0;

        return new RevenueBreakdownDto(
                kpis.getTotalRevenue(),
                avgDaily,
                maxDaily,
                minDaily,
                kpis.getTotalOrders(),
                kpis.getAverageOrderValue()
        );
    }

    private CustomerMetricsDto getCustomerMetrics(LocalDateTime startDate, LocalDateTime endDate, DashboardKPIsDto kpis) {
        double retentionRate = calculateRetentionRate(startDate, endDate);
        ChurnAnalysisDto churnAnalysis = analyzeChurnRate(startDate, endDate);

        Double avgCustomerValue = kpis.getTotalCustomers() > 0
                ? kpis.getTotalRevenue() / kpis.getTotalCustomers()
                : 0.0;

        return new CustomerMetricsDto(
                kpis.getTotalCustomers(),
                kpis.getNewCustomers(),
                kpis.getReturningCustomers(),
                retentionRate,
                churnAnalysis.getChurnRate(),
                avgCustomerValue
        );
    }

    private InventoryMetricsDto getInventoryMetrics() {
        Long totalProducts = productRepository.count();
        Long activeProducts = productRepository.countActiveProducts();
        Long lowStockProducts = productRepository.countLowStockProducts();
        Long outOfStockProducts = productRepository.countOutOfStockProducts();
        Object[] inventoryStats = productRepository.calculateInventoryStats();

        Double avgStockLevel = inventoryStats[0] != null ? ((Number) inventoryStats[0]).doubleValue() : 0.0;
        Double totalInventoryValue = inventoryStats[1] != null ? ((Number) inventoryStats[1]).doubleValue() : 0.0;

        return new InventoryMetricsDto(
                totalProducts,
                activeProducts,
                lowStockProducts,
                outOfStockProducts,
                avgStockLevel,
                totalInventoryValue
        );
    }

    private Double calculateHealthScore(DashboardKPIsDto kpis, PeriodComparisonDto comparison, InventoryMetricsDto inventory) {
        double score = 50.0;

        if (comparison.getRevenueChangePercent() > 10) score += 15;
        else if (comparison.getRevenueChangePercent() > 0) score += 10;
        else if (comparison.getRevenueChangePercent() > -10) score -= 5;
        else score -= 15;

        if (comparison.getCustomersChangePercent() > 10) score += 10;
        else if (comparison.getCustomersChangePercent() > 0) score += 5;
        else if (comparison.getCustomersChangePercent() > -10) score -= 5;
        else score -= 10;

        if (kpis.getAverageRating() >= 4.5) score += 10;
        else if (kpis.getAverageRating() >= 4.0) score += 5;
        else if (kpis.getAverageRating() < 3.0) score -= 10;

        if (kpis.getConversionRate() > 5) score += 10;
        else if (kpis.getConversionRate() > 2) score += 5;
        else score -= 5;

        long totalActive = inventory.getActiveProducts();
        if (totalActive > 0) {
            double outOfStockRatio = (double) inventory.getOutOfStockProducts() / totalActive;
            if (outOfStockRatio > 0.2) score -= 10;
            else if (outOfStockRatio > 0.1) score -= 5;
            else score += 5;
        }

        return Math.max(0, Math.min(100, score));
    }


    private List<String> generateAlerts(DashboardKPIsDto kpis, PeriodComparisonDto comparison, InventoryMetricsDto inventory) {
        List<String> alerts = new ArrayList<>();

        if (comparison.getRevenueChangePercent() < -20) {
            alerts.add("CRITICAL: Revenue dropped by " + String.format("%.1f", Math.abs(comparison.getRevenueChangePercent())) + "% compared to previous period");
        }

        if (comparison.getCustomersChangePercent() < -15) {
            alerts.add("WARNING: Customer count decreased by " + String.format("%.1f", Math.abs(comparison.getCustomersChangePercent())) + "%");
        }

        if (inventory.getOutOfStockProducts() > 0) {
            alerts.add("INVENTORY: " + inventory.getOutOfStockProducts() + " products are out of stock");
        }

        if (inventory.getLowStockProducts() > 5) {
            alerts.add("INVENTORY: " + inventory.getLowStockProducts() + " products have low stock levels");
        }

        if (kpis.getAverageRating() < 3.5) {
            alerts.add("QUALITY: Average product rating is below 3.5 stars");
        }

        if (kpis.getConversionRate() < 1) {
            alerts.add("CONVERSION: Conversion rate is below 1%");
        }

        if (alerts.isEmpty()) {
            alerts.add("No critical alerts - business metrics are healthy");
        }

        return alerts;
    }


    @Override
    public PeriodComparisonDto comparePeriods(LocalDateTime period1Start, LocalDateTime period1End,
                                              LocalDateTime period2Start, LocalDateTime period2End) {
        Object[] period1Metrics = saleRepository.calculatePeriodMetrics(period1Start, period1End);
        Object[] period2Metrics = saleRepository.calculatePeriodMetrics(period2Start, period2End);

        Double period1Revenue = period1Metrics[0] != null ? ((Number) period1Metrics[0]).doubleValue() : 0.0;
        Long period1Orders = period1Metrics[1] != null ? ((Number) period1Metrics[1]).longValue() : 0L;
        Long period1Customers = period1Metrics[2] != null ? ((Number) period1Metrics[2]).longValue() : 0L;
        Long period1ProductsSold = period1Metrics[3] != null ? ((Number) period1Metrics[3]).longValue() : 0L;

        Double period2Revenue = period2Metrics[0] != null ? ((Number) period2Metrics[0]).doubleValue() : 0.0;
        Long period2Orders = period2Metrics[1] != null ? ((Number) period2Metrics[1]).longValue() : 0L;
        Long period2Customers = period2Metrics[2] != null ? ((Number) period2Metrics[2]).longValue() : 0L;
        Long period2ProductsSold = period2Metrics[3] != null ? ((Number) period2Metrics[3]).longValue() : 0L;

        Double revenueChange = period2Revenue - period1Revenue;
        Double revenueChangePercent = period1Revenue > 0 ? (revenueChange / period1Revenue) * 100 : 0.0;

        Long ordersChange = period2Orders - period1Orders;
        Double ordersChangePercent = period1Orders > 0 ? ((double) ordersChange / period1Orders) * 100 : 0.0;

        Long customersChange = period2Customers - period1Customers;
        Double customersChangePercent = period1Customers > 0 ? ((double) customersChange / period1Customers) * 100 : 0.0;

        Long productsSoldChange = period2ProductsSold - period1ProductsSold;
        Double productsSoldChangePercent = period1ProductsSold > 0 ? ((double) productsSoldChange / period1ProductsSold) * 100 : 0.0;

        Double period1AvgOrderValue = period1Orders > 0 ? period1Revenue / period1Orders : 0.0;
        Double period2AvgOrderValue = period2Orders > 0 ? period2Revenue / period2Orders : 0.0;
        Double avgOrderValueChange = period2AvgOrderValue - period1AvgOrderValue;
        Double avgOrderValueChangePercent = period1AvgOrderValue > 0 ? (avgOrderValueChange / period1AvgOrderValue) * 100 : 0.0;

        String overallTrend = determineOverallTrend(revenueChangePercent, ordersChangePercent, customersChangePercent);

        return new PeriodComparisonDto(
                period1Start,
                period1End,
                period2Start,
                period2End,
                period1Revenue,
                period2Revenue,
                revenueChange,
                revenueChangePercent,
                period1Orders,
                period2Orders,
                ordersChange,
                ordersChangePercent,
                period1Customers,
                period2Customers,
                customersChange,
                customersChangePercent,
                period1ProductsSold,
                period2ProductsSold,
                productsSoldChange,
                productsSoldChangePercent,
                period1AvgOrderValue,
                period2AvgOrderValue,
                avgOrderValueChange,
                avgOrderValueChangePercent,
                overallTrend
        );
    }

    private String determineOverallTrend(Double revenueChange, Double ordersChange, Double customersChange) {
        double avgChange = (revenueChange + ordersChange + customersChange) / 3;

        if (avgChange > 10) {
            return "STRONG_GROWTH";
        } else if (avgChange > 0) {
            return "GROWTH";
        } else if (avgChange > -10) {
            return "DECLINE";
        } else {
            return "STRONG_DECLINE";
        }
    }

    @Override
    public List<AnomalyDetectionDto> detectSalesAnomalies(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> salesData = saleRepository.findDailySalesInPeriod(startDate, endDate);

        if (salesData.isEmpty()) {
            return new ArrayList<>();
        }

        List<DailySalesDto> dailySales = salesData.stream()
                .map(row -> new DailySalesDto(
                        (LocalDate) row[0],
                        ((Number) row[1]).doubleValue()
                ))
                .toList();

        AnomalyDetectionRequestDto request = new AnomalyDetectionRequestDto(dailySales, 2.0);

        return fastApiClient.detectAnomalies(request);
    }

    @Override
    public List<StockoutPredictionDto> predictStockouts(int daysAhead) {
        List<Object[]> products = soldProductRepository.findAllActiveProductsWithStock();

        if (products.isEmpty()) {
            return new ArrayList<>();
        }

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        List<StockoutInputDto> inputs = products.stream()
                .map(row -> {
                    Long productId = ((Number) row[0]).longValue();
                    String productName = (String) row[1];
                    Long currentStock = row[2] != null ? ((Number) row[2]).longValue() : 0L;

                    List<Object[]> salesData = soldProductRepository.findDailyQuantitySoldByProduct(productId, thirtyDaysAgo);

                    List<DailySalesDto> recentSales = salesData.stream()
                            .map(r -> new DailySalesDto(
                                    (LocalDate) r[0],
                                    ((Number) r[1]).doubleValue()
                            ))
                            .toList();

                    return new StockoutInputDto(
                            productId,
                            productName,
                            currentStock,
                            recentSales,
                            daysAhead
                    );
                })
                .toList();

        return fastApiClient.predictStockouts(inputs);
    }


    @Override
    public List<PotentialBestSellerDto> identifyPotentialBestSellers() {
        List<Object[]> productMetrics = soldProductRepository.findProductMetricsForBestSeller();

        if (productMetrics.isEmpty()) {
            return new ArrayList<>();
        }

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        List<BestSellerInputDto> inputs = productMetrics.stream()
                .map(row -> {
                    Long productId = ((Number) row[0]).longValue();
                    String productName = (String) row[1];
                    String categoryName = row[2] != null ? (String) row[2] : "Uncategorized";
                    Integer totalReviews = row[3] != null ? ((Number) row[3]).intValue() : 0;
                    Double avgRating = row[4] != null ? ((Number) row[4]).doubleValue() : 0.0;
                    LocalDateTime createdAt = row[5] != null ? (LocalDateTime) row[5] : LocalDateTime.now();

                    int daysOnMarket = (int) java.time.temporal.ChronoUnit.DAYS.between(createdAt, LocalDateTime.now());

                    List<Object[]> recentSalesData = soldProductRepository.findRecentSalesByProduct(productId, thirtyDaysAgo);

                    List<DailySalesDto> recentSales = recentSalesData.stream()
                            .map(r -> new DailySalesDto(
                                    (LocalDate) r[0],
                                    ((Number) r[1]).doubleValue()
                            ))
                            .toList();

                    return new BestSellerInputDto(
                            productId,
                            productName,
                            categoryName,
                            totalReviews,
                            avgRating,
                            daysOnMarket,
                            recentSales
                    );
                })
                .toList();

        return fastApiClient.identifyBestSellers(inputs);
    }


    @Override
    public RankingPredictionDto predictFutureRanking(Long productId, int daysAhead) {
        List<Object[]> allProductsSales = soldProductRepository.findAllProductsWithTotalSales();

        if (allProductsSales.isEmpty()) {
            return new RankingPredictionDto(productId, null, 0, 0, 0.0, 0.0, "STABLE", daysAhead);
        }

        List<RankingPredictionInputDto> allProductsInput = new ArrayList<>();

        for (Object[] row : allProductsSales) {
            Long pId = ((Number) row[0]).longValue();
            String pName = (String) row[1];

            List<Object[]> dailySales = soldProductRepository.findDailySalesByProduct(pId);

            List<DailySalesDto> historicalSales = dailySales.stream()
                    .map(r -> new DailySalesDto(
                            (LocalDate) r[0],
                            ((Number) r[1]).doubleValue()
                    ))
                    .toList();

            allProductsInput.add(new RankingPredictionInputDto(
                    pId,
                    pName,
                    historicalSales,
                    daysAhead
            ));
        }

        RankingPredictionRequestDto request = new RankingPredictionRequestDto(
                productId,
                daysAhead,
                allProductsInput
        );

        return fastApiClient.predictRanking(request);
    }

    @Override
    public DashboardKPIsDto calculateMainKPIs(LocalDateTime startDate, LocalDateTime endDate) {
        Object[] revenueMetrics = saleRepository.calculateRevenueMetrics(startDate, endDate);
        Long newCustomers = saleRepository.countNewCustomers(startDate, endDate);
        Long returningCustomers = saleRepository.countReturningCustomers(startDate, endDate);
        Object[] reviewMetrics = reviewsRepository.calculateReviewMetrics(startDate, endDate);
        Long totalUsers = usersRepository.countTotalUsers(endDate);

        Double totalRevenue = revenueMetrics[0] != null ? ((Number) revenueMetrics[0]).doubleValue() : 0.0;
        Long totalOrders = revenueMetrics[1] != null ? ((Number) revenueMetrics[1]).longValue() : 0L;
        Long totalCustomers = revenueMetrics[2] != null ? ((Number) revenueMetrics[2]).longValue() : 0L;
        Long totalProductsSold = revenueMetrics[3] != null ? ((Number) revenueMetrics[3]).longValue() : 0L;

        Double averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0.0;
        Double revenuePerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0.0;
        Double averageBasketSize = totalOrders > 0 ? (double) totalProductsSold / totalOrders : 0.0;

        Long totalReviews = reviewMetrics[0] != null ? ((Number) reviewMetrics[0]).longValue() : 0L;
        Double averageRating = reviewMetrics[1] != null ? ((Number) reviewMetrics[1]).doubleValue() : 0.0;

        Double conversionRate = totalUsers > 0 ? ((double) totalCustomers / totalUsers) * 100 : 0.0;

        return new DashboardKPIsDto(
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalProductsSold,
                averageOrderValue,
                revenuePerCustomer,
                newCustomers,
                returningCustomers,
                averageBasketSize,
                totalReviews,
                averageRating,
                conversionRate
        );
    }

    @Override
    public List<ChurnPredictionDto> predictCustomerChurn() {
        List<Object[]> rawData = saleRepository.findUserPurchaseMetrics();

        if (rawData.isEmpty()) {
            return new ArrayList<>();
        }

        List<ChurnInputDto> churnInputs = rawData.stream()
                .map(row -> {
                    Long userId = ((Number) row[0]).longValue();
                    Integer daysSinceLastPurchase = row[1] != null ? ((Number) row[1]).intValue() : 999;
                    Integer totalPurchases = ((Number) row[2]).intValue();
                    Double totalSpent = row[3] != null ? ((Number) row[3]).doubleValue() : 0.0;
                    Double avgOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0.0;
                    Integer purchaseFrequency = totalPurchases;

                    return new ChurnInputDto(
                            userId,
                            daysSinceLastPurchase,
                            totalPurchases,
                            totalSpent,
                            avgOrderValue,
                            purchaseFrequency
                    );
                })
                .toList();

        return fastApiClient.predictChurn(churnInputs);
    }

    @Override
    public SegmentBehaviorAnalysisDto analyzeBehaviorBySegment(String segmentName) {
        Segment segment = Segment.valueOf(segmentName.toUpperCase());

        Object[] row = saleRepository.analyzeSegmentBehavior(segment);

        if (row == null || row[0] == null) {
            return new SegmentBehaviorAnalysisDto(segmentName, 0L, 0L, 0.0, 0.0, 0.0, 0L);
        }

        Long totalUsers = ((Number) row[0]).longValue();
        Long totalPurchases = ((Number) row[1]).longValue();
        Double totalRevenue = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
        Long totalProductsBought = row[3] != null ? ((Number) row[3]).longValue() : 0L;

        Double avgOrderValue = totalPurchases > 0 ? totalRevenue / totalPurchases : 0.0;
        Double avgPurchasesPerUser = totalUsers > 0 ? (double) totalPurchases / totalUsers : 0.0;

        return new SegmentBehaviorAnalysisDto(
                segmentName,
                totalUsers,
                totalPurchases,
                totalRevenue,
                avgOrderValue,
                avgPurchasesPerUser,
                totalProductsBought
        );
    }


    // perform Recency, frequency and monetary analysis
    @Override
    public List<RFMSegmentDto> performRFMAnalysis() {

        List<Object[]> rawData = saleRepository.computeRFMRaw();

        if (rawData.isEmpty()) {
            return List.of();
        }

        List<RFMInputDto> input = new ArrayList<>();

        for (Object[] row : rawData) {

            Long customerId = (Long) row[0];
            LocalDateTime lastPurchaseDate =
                    (LocalDateTime) row[1];
            Long purchaseCount = (Long) row[2];
            Double totalAmount = (Double) row[3];

            RFMInputDto dto = new RFMInputDto();
            dto.setCustomerId(customerId);
            dto.setLastPurchaseDate(
                    lastPurchaseDate.toLocalDate()
            );
            dto.setPurchaseCount(
                    purchaseCount.intValue()
            );
            dto.setTotalAmount(totalAmount);

            input.add(dto);
        }

        return fastApiClient.performRFMAnalysis(input);
    }


    private LocalDateTime truncateDate(LocalDateTime date, TimeGranularity timeGranularity) {
        switch(timeGranularity) {
            case DAILY:
                return date.toLocalDate().atStartOfDay();
            case WEEKLY:
                return date.with(DayOfWeek.MONDAY)
                        .toLocalDate()
                        .atStartOfDay();
            case MONTHLY:
                return date.withDayOfMonth(1)
                        .toLocalDate()
                        .atStartOfDay();

            case YEARLY:
                return date.withDayOfYear(1)
                        .toLocalDate()
                        .atStartOfDay();
            default:
                throw new IllegalArgumentException("Unsupported granularity: " + timeGranularity);
        }
    }
    @Override
    public SalesTrendAnalysisDto analyzeSalesTrend(LocalDateTime startDate, LocalDateTime endDate, TimeGranularity granularity) {
        List<Sale> sales =  saleRepository.findByDateOfSaleBetween(startDate, endDate);

        Map<LocalDateTime, List<Sale>> groupedSales =
                sales.stream().collect(Collectors.groupingBy(
                        sale -> truncateDate(sale.getDateOfSale(), granularity)
                ));

        List<SalesTrendPointDto> points = new ArrayList<>();


        for (Map.Entry<LocalDateTime, List<Sale>> entry : groupedSales.entrySet()) {

            double totalRevenue = 0;
            long totalSalesCount = 0;
            long totalQuantity = 0;

            List<Sale> group = entry.getValue();
            LocalDateTime periodStart = entry.getKey();

            for (Sale sale : group){
                totalSalesCount++;

                for (SoldProduct sp : sale.getSoldProducts()){
                    totalQuantity += sp.getQuantity();
                    totalRevenue += sp.getQuantity() * sp.getUnitPrice();
                }
            }

            double averageSaleValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

            points.add(new SalesTrendPointDto(
                    periodStart,
                    totalRevenue,
                    totalSalesCount,
                    totalQuantity,
                    averageSaleValue
            ));
        }

        return new SalesTrendAnalysisDto(
                startDate,
                endDate,
                granularity,
                points
        );
    }


    private double computeSaleTotal(Sale sale) {
        return sale.getSoldProducts().stream()
                .mapToDouble(p -> p.getUnitPrice() * p.getQuantity())
                .sum();
    }

    private double variance(List<Double> values) {
        if (values == null || values.isEmpty()) {
            return 0;
        }
        double mean = values.stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0);

        double squaredDiffSum = values.stream()
                .mapToDouble(v -> Math.pow(v - mean, 2))
                .sum();
        return squaredDiffSum / values.size();
    }
    @Override
    public double calculateSalesGrowthRate(LocalDateTime period1Start, LocalDateTime period1End, LocalDateTime period2Start, LocalDateTime period2End) {
        List<Sale> period1Sales = saleRepository.findByDateOfSaleBetween(period1Start, period1End);
        List<Sale> period2Sales = saleRepository.findByDateOfSaleBetween(period2Start, period2End);

        double revenue1 = period1Sales.stream()
                .flatMap(sale -> sale.getSoldProducts().stream())
                .mapToDouble(sp -> sp.getUnitPrice() * sp.getQuantity())
                .sum();
        double revenue2 = period2Sales.stream()
                .flatMap(sale -> sale.getSoldProducts().stream())
                .mapToDouble(sp -> sp.getUnitPrice() * sp.getQuantity())
                .sum();
        if (revenue1 == 0) {
            return revenue2 == 0 ? 0 : 100.0; // avoid division by zero
        }
        return ((revenue2 - revenue1) / revenue1) * 100;
    }

    @Override
    public SeasonalityAnalysisDto analyzeSeasonality(LocalDateTime startDate, LocalDateTime endDate) {

        List<Sale> sales = saleRepository.findByDateOfSaleBetween(startDate, endDate);

        if (sales.isEmpty())
            return new SeasonalityAnalysisDto();

        Map<LocalDate, Double> dailySales = sales.stream()
                .collect(Collectors.groupingBy(
                        sale -> sale.getDateOfSale().toLocalDate(),
                        Collectors.summingDouble(this::computeSaleTotal)
                ));
        List<TimeSeriesPointDto> originalSeries = new ArrayList<>();
        LocalDate cursor = startDate.toLocalDate();
        while (!cursor.isAfter(endDate.toLocalDate())) {
            originalSeries.add(new TimeSeriesPointDto(
                    cursor.atStartOfDay(),
                    dailySales.getOrDefault(cursor, 0.0)
            ));
            cursor = cursor.plusDays(1);
        }
        int window = 7;

        // List that will store the trend component
        List<TimeSeriesPointDto> trendSeries = new ArrayList<>();

        // Iterate through each point of the original series
        for (int i = 0; i < originalSeries.size(); i++) {

            // Calculate left boundary of the window
            int from = Math.max(0, i - window / 2);

            // Calculate right boundary of the window
            int to = Math.min(originalSeries.size(), i + window / 2 + 1);

            // Compute the average value inside the window
            double avg = originalSeries.subList(from, to)
                    .stream()
                    .mapToDouble(TimeSeriesPointDto::getValue)
                    .average()
                    .orElse(0);

            // Store the smoothed value as the trend
            trendSeries.add(new TimeSeriesPointDto(
                    originalSeries.get(i).getTimestamp(),
                    avg
            ));
        }

        List<Double> detrendedValues = new ArrayList<>();

        for (int i = 0; i < originalSeries.size(); i++) {
            detrendedValues.add(
                    originalSeries.get(i).getValue()
                            - trendSeries.get(i).getValue()
            );
        }

        Map<DayOfWeek, List<Double>> byDayOfWeek =
                new EnumMap<>(DayOfWeek.class);

        for (int i = 0; i < detrendedValues.size(); i++) {

            DayOfWeek day = originalSeries.get(i)
                    .getTimestamp()
                    .getDayOfWeek();

            byDayOfWeek
                    .computeIfAbsent(day, k -> new ArrayList<>())
                    .add(detrendedValues.get(i));
        }

        Map<DayOfWeek, Double> seasonalAverages =
                new EnumMap<>(DayOfWeek.class);

        for (DayOfWeek day : byDayOfWeek.keySet()) {
            seasonalAverages.put(
                    day,
                    byDayOfWeek.get(day).stream()
                            .mapToDouble(Double::doubleValue)
                            .average()
                            .orElse(0)
            );
        }

        List<TimeSeriesPointDto> seasonalSeries = new ArrayList<>();

        for (TimeSeriesPointDto point : originalSeries) {
            seasonalSeries.add(new TimeSeriesPointDto(
                    point.getTimestamp(),
                    seasonalAverages.get(
                            point.getTimestamp().getDayOfWeek()
                    )
            ));
        }

        List<TimeSeriesPointDto> residualSeries = new ArrayList<>();

        for (int i = 0; i < originalSeries.size(); i++) {

            double residual =
                    originalSeries.get(i).getValue()
                            - trendSeries.get(i).getValue()
                            - seasonalSeries.get(i).getValue();

            residualSeries.add(new TimeSeriesPointDto(
                    originalSeries.get(i).getTimestamp(),
                    residual
            ));
        }

        double originalVariance = variance(
                originalSeries.stream()
                        .map(TimeSeriesPointDto::getValue)
                        .toList()
        );

        double seasonalVariance = variance(
                seasonalSeries.stream()
                        .map(TimeSeriesPointDto::getValue)
                        .toList()
        );

        double seasonalityStrength =
                originalVariance == 0 ? 0
                        : seasonalVariance / originalVariance;

        SeasonalityType seasonalityType =
                seasonalityStrength > 0.15
                        ? SeasonalityType.WEEKLY
                        : SeasonalityType.NONE;

        SeasonalityAnalysisDto dto = new SeasonalityAnalysisDto();

        dto.setOriginalSeries(originalSeries);
        dto.setTrendSeries(trendSeries);
        dto.setSeasonalSeries(seasonalSeries);
        dto.setResidualSeries(residualSeries);
        dto.setSeasonalityStrength(seasonalityStrength);
        dto.setSeasonalityType(seasonalityType);

        return dto;
    }

    @Override
    public SalesForecastDto forecastSales(int daysAhead) {

        List<Object[]> rawData = saleRepository.findAllSalesWithTotals();
        if (rawData.isEmpty()) {
            return new SalesForecastDto();
        }

        Map<LocalDate, Double> dailySales = rawData.stream()
                .collect(Collectors.groupingBy(
                        row -> {
                            Object dateObj = row[0];
                            if (dateObj instanceof LocalDate) {
                                return (LocalDate) dateObj;
                            } else if (dateObj instanceof LocalDateTime) {
                                return ((LocalDateTime) dateObj).toLocalDate();
                            }
                            throw new IllegalStateException("Unexpected date type");
                        },
                        // Sum the sales amounts from row[1]
                        Collectors.summingDouble(row -> ((Number) row[1]).doubleValue())
                ));

        // Step 3: Convert Map to sorted List of ForecastPointDto (historical data)
        List<ForecastPointDto> historicalSeries =
                dailySales.entrySet().stream()
                        // Sort by date ascending
                        .sorted(Map.Entry.comparingByKey())
                        // Create DTO with date and actual sales
                        .map(e -> new ForecastPointDto(e.getKey(), e.getValue()))
                        .toList();

        // Create DTO that contains the historical data
        SalesForecastDto requestDto = new SalesForecastDto();
        requestDto.setModel("ARIMA");
        requestDto.setForecast(historicalSeries);
        requestDto.setDaysAhead(daysAhead);

        // Step 5: Call FastAPI service
        SalesForecastDto forecastResponse = fastApiClient.getForecast(requestDto);

        return forecastResponse;
    }

    @Override
    public CohortAnalysisDto analyzeCohorts(LocalDateTime startDate, LocalDateTime endDate) {
        List<Users> users = usersRepository.findByCreatedAtBetween(startDate, endDate);
        Map<YearMonth, List<Users>> cohorts = users.stream()
                .collect(Collectors.groupingBy(
                        u -> YearMonth.from(u.getCreatedAt())
                ));
        int totalUsers =  users.size();
        int totalCohots = cohorts.size();
        int activeUsers = (int)users.stream()
                .filter(Users::isActive)
                .count();
        double avgUsersPerCohort =
                totalCohots == 0 ? 0 : (double) totalUsers / totalCohots;
        return new CohortAnalysisDto(
                totalUsers,
                totalCohots,
                activeUsers,
                avgUsersPerCohort
        );
    }

    @Override
    public double calculateAverageBasketValue(LocalDateTime startDate, LocalDateTime endDate) {

        List<Sale> sales = saleRepository.findByDateOfSaleBetween(startDate, endDate);
        if (sales.isEmpty()) {return 0.0;}
        double totalRevenue = sales.stream()
                .flatMap(s -> s.getSoldProducts().stream())
                .mapToDouble(sp -> sp.getQuantity() * sp.getUnitPrice())
                .sum();
        return totalRevenue / sales.size();
    }

    @Override
    public List<PurchaseFrequencyAnalysisDto> analyzePurchaseFrequency(){

        List<Object[]> results = saleRepository.countSalesByUser();
        List<PurchaseFrequencyAnalysisDto> analysis = new ArrayList<>();

        for (Object[] row : results) {
            Long userId = (Long) row[0];
            String username = (String) row[1];
            Long totalSales = (Long) row[2];

            double avgPerMonth = (double) totalSales / 12 ;

            analysis.add(
                    new PurchaseFrequencyAnalysisDto(
                            userId,
                            username,
                            totalSales,
                            avgPerMonth
                    )
            );
        }
        return analysis ;
    }

    @Override
    public ABCAnalysisDto performABCAnalysis() {

        List<Sale> sales = saleRepository.findAll();

        if (sales.isEmpty()) {
            return new ABCAnalysisDto();
        }

        Map<Long, ABCProductDto> productRevenueMap = new HashMap<>();

        for (Sale sale : sales) {

            for (SoldProduct sp : sale.getSoldProducts()) {

                // Extract product info
                Long productId = sp.getProduct().getId();
                String productName = sp.getProduct().getName();

                // Compute revenue contribution
                double revenue = sp.getUnitPrice() * sp.getQuantity();

                // If product already exists, add revenue
                productRevenueMap
                        .computeIfAbsent(productId, id -> {
                            ABCProductDto dto = new ABCProductDto();
                            dto.setProductId(id);
                            dto.setProductName(productName);
                            dto.setRevenue(0);
                            return dto;
                        })
                        .setRevenue(
                                productRevenueMap.get(productId).getRevenue() + revenue
                        );
            }
        }

        List<ABCProductDto> products = new ArrayList<>(
                productRevenueMap.values()
        );

        // Sort products from highest to lowest revenue
        products.sort(
                Comparator.comparingDouble(ABCProductDto::getRevenue)
                        .reversed()
        );

        double totalRevenue = products.stream()
                .mapToDouble(ABCProductDto::getRevenue)
                .sum();

        double cumulativeRevenue = 0;

        List<ABCProductDto> classA = new ArrayList<>();
        List<ABCProductDto> classB = new ArrayList<>();
        List<ABCProductDto> classC = new ArrayList<>();

        for (ABCProductDto product : products) {

            cumulativeRevenue += product.getRevenue();

            double revenuePercentage =
                    (product.getRevenue() / totalRevenue) * 100;

            double cumulativePercentage =
                    (cumulativeRevenue / totalRevenue) * 100;

            product.setRevenuePercentage(revenuePercentage);
            product.setCumulativePercentage(cumulativePercentage);

            if (cumulativePercentage <= 80) {
                product.setAbcClass('A');
                classA.add(product);
            }
            else if (cumulativePercentage <= 95) {
                product.setAbcClass('B');
                classB.add(product);
            }
            else {
                product.setAbcClass('C');
                classC.add(product);
            }
        }

        ABCAnalysisDto dto = new ABCAnalysisDto();
        dto.setClassA(classA);
        dto.setClassB(classB);
        dto.setClassC(classC);
        dto.setTotalRevenue(totalRevenue);

        return dto;
    }

    //still needs controller and front
    @Override
    public ProductAffinityAnalysisDto analyzeProductAffinity(int minSupportCount) {

        List<SaleDto> sales = saleRepository.findAll().stream()
                .map(saleMapper::toDto)
                .toList();
        Map<String, Integer> pairCountMap = new HashMap<>();

        for (SaleDto sale: sales) {
            List<ProductOrderInfoDto> soldProducts = sale.getProductOrderInfoList();
            if (soldProducts.size() < 2) continue;

            for (int i = 0; i < soldProducts.size(); i++){
                for(int j = 0; j < soldProducts.size(); i++){
                    Long productId1 = soldProducts.get(i).getProductId();
                    Long productId2 = soldProducts.get(j).getProductId();
                    String key = generatePairKey(productId1, productId2);

                    pairCountMap.put(key, pairCountMap.getOrDefault(key, 0) + 1);

                }
            }
        }
        List<ProductAffinityAnalysisDto.ProductPair> frequentPairs = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : pairCountMap.entrySet()) {
            if (entry.getValue() >= minSupportCount) {
                String[] ids = entry.getKey().split("__");
                Product p1 = new Product(); p1.setId(Long.parseLong(ids[0]));
                Product p2 = new Product(); p2.setId(Long.parseLong(ids[1]));

                frequentPairs.add(new ProductAffinityAnalysisDto.ProductPair(p1, p2, entry.getValue()));
            }
        }

        return new ProductAffinityAnalysisDto(frequentPairs);
    }

    @Override
    public List<AssociationRuleDto> performMarketBasketAnalysis(double minSupport, double minConfidence) {
        List<SaleDto> sales = saleRepository.findAll().stream()
                .map(saleMapper::toDto)
                .toList();
        List<Map<Long, Integer>> transactions = new ArrayList<>();
        for (SaleDto sale : sales) {
            Map<Long, Integer> transaction = new HashMap<>();
            for (ProductOrderInfoDto sp : sale.getProductOrderInfoList() != null
                    ? sale.getProductOrderInfoList()
                    : Collections.<ProductOrderInfoDto>emptyList()) {
                // process sp
                transaction.put(sp.getProductId(), 1);
            }
            transactions.add(transaction);
        }
        return fastApiClient.performMarketBasketAnalysis(minSupport, minConfidence, transactions);
    }

    private String generatePairKey(Long id1, Long id2) {
        return id1 < id2 ? id1 + "__" + id2 : id2 + "__" + id1;
    }

    @Override
    public ChurnAnalysisDto analyzeChurnRate(LocalDateTime startDate, LocalDateTime endDate) {
        Long usersAtStart = saleRepository.countUsersBeforeDate(startDate);
        Long churnedUsers = saleRepository.countChurnedUsers(startDate, endDate);
        Long activeUsers = saleRepository.countActiveUsersDuringPeriod(startDate, endDate);

        if (usersAtStart == null || usersAtStart == 0) {
            return new ChurnAnalysisDto(0L, 0L, 0.0, 0L, 0L);
        }

        double churnRate = ((double) churnedUsers / usersAtStart) * 100;
        Long totalUsersAtEnd = usersAtStart - churnedUsers + activeUsers;

        return new ChurnAnalysisDto(
                usersAtStart,
                churnedUsers,
                churnRate,
                activeUsers,
                totalUsersAtEnd
        );
    }

    @Override
    public double calculateCustomerLifetimeValue(Long userId) {
        return 0;
    }

    @Override
    public double calculateRetentionRate(LocalDateTime startDate, LocalDateTime endDate) {
        Long usersAtStart = saleRepository.countUsersBeforeDate(startDate);
        Long usersAtEnd = saleRepository.countUsersByEndDate(endDate);
        Long newUsers = saleRepository.countNewUsersDuringPeriod(startDate, endDate);

        if (usersAtStart == null || usersAtStart == 0) {
            return 0.0;
        }

        long retainedUsers = usersAtEnd - newUsers;
        return ((double) retainedUsers / usersAtStart) * 100;
    }

    @Override
    public ProductLifecycleDto analyzeProductLifecycle(Long productId) {
        List<MonthlySalesDto> monthlySales = saleRepository.findMonthlySalesByProduct(productId);
        if (monthlySales == null || monthlySales.size() < 0)
        {
            return new ProductLifecycleDto(
                    productId,
                    ProductLifecyclePhase.INTRODUCTION,
                    0.0,
                    0.0
            );
        }

        List<Long> quantities = monthlySales.stream()
                .map(MonthlySalesDto::getTotalQuantity)
                .toList();
        double averageMonthlySales = quantities.stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);

        Long first = quantities.getFirst();
        Long last = quantities.getLast();

        double growthRate = (first == 0) ? 0.0 : (double) (last - first) / first ;

        ProductLifecyclePhase phase;

        if (growthRate > 0.20) {
            phase = ProductLifecyclePhase.GROWTH;
        } else if (growthRate >= -0.05) {
            phase = ProductLifecyclePhase.MATURITY;
        } else {
            phase = ProductLifecyclePhase.DECLINE;
        }

        return new ProductLifecycleDto(
                productId,
                phase,
                averageMonthlySales,
                growthRate
        );
    }

    @Override
    public double calculateInventoryTurnoverRatio(
            Long productId,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {

        Double costOfSales = saleRepository.calculateCostOfSales(
                productId, startDate, endDate
        );

        if (costOfSales == null || costOfSales == 0) {
            return 0.0;
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Long currentStock = product.getStock();

        double averageStock = currentStock / 2.0;

        if (averageStock == 0) {
            return 0.0;
        }

        return costOfSales / averageStock;
    }

    @Override
    public List<CategoryPerformanceDto> analyzeCategoryPerformance(
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {

        List<Object[]> results =
                soldProductRepository.analyzeCategoryPerformance(
                        startDate, endDate
                );

        List<CategoryPerformanceDto> analysis = new ArrayList<>();

        for (Object[] row : results) {

            analysis.add(
                    new CategoryPerformanceDto(
                            (Long) row[0],      // categoryId
                            (String) row[1],    // categoryName
                            (Long) row[2],      // totalQuantitySold
                            (Double) row[3],    // totalRevenue
                            (Long) row[4]       // totalSales
                    )
            );
        }

        return analysis;
    }

    @Override
    public List<ProfitMarginAnalysisDto> analyzeProfitMargins() {

        List<Object[]> results =
                soldProductRepository.analyzeProfitMargins();

        List<ProfitMarginAnalysisDto> analysis = new ArrayList<>();

        for (Object[] row : results) {

            Long productId = (Long) row[0];
            String productName = (String) row[1];
            Double revenue = (Double) row[2];
            Double cost = (Double) row[3];

            Double profit = revenue - cost;

            Double margin = revenue == 0
                    ? 0
                    : (profit / revenue) * 100;

            analysis.add(
                    new ProfitMarginAnalysisDto(
                            productId,
                            productName,
                            revenue,
                            cost,
                            profit,
                            margin
                    )
            );
        }

        // Sort products by profit margin (high → low)
        analysis.sort(
                Comparator.comparing(
                        ProfitMarginAnalysisDto::getProfitMargin
                ).reversed()
        );

        return analysis;
    }

    @Override
    public PromotionImpactAnalysisDto analyzePromotionImpact() {

        Object[] row = soldProductRepository.analyzePromotionImpact();

        if (row == null) {
            return new PromotionImpactAnalysisDto(0.0, 0L, 0.0);
        }

        Double avgDiscount = (Double) row[0];
        Long totalUnits = (Long) row[1];
        Double totalRevenue = (Double) row[2];

        return new PromotionImpactAnalysisDto(avgDiscount, totalUnits, totalRevenue);
    }

    @Override
    public List<CustomerSegmentDto> segmentCustomers(int numberOfSegments) {
        List<UsersDto> customers = usersService.getUsersByRole(Role.CLIENT);

        List<Map> data = new ArrayList<>();
        for(UsersDto user : customers) {
            Map<String,Object> map = new HashMap<>();

            Long customerId = user.getId();

            List<SaleDto> sales = saleService.getSalesByUser(customerId);
            double totalSalesAmount = 0;
            for (SaleDto sale : sales) {
                totalSalesAmount += soldProductService.getTotalPriceBySale(sale.getId());
            }
            int totalSales = saleService.getSalesByUser(customerId).size();

            map.put("usersId", customerId);
            map.put("totalSales", totalSales);
            map.put("totalReviews", reviewsService.getReviewCountByUser(customerId));
            map.put("avgReviewRating", reviewsService.getAverageRatingByUser(customerId));
            map.put("searchCount", searchHistoryService.getCountSearchHistory(customerId));
            map.put("totalSpent", totalSalesAmount);
            map.put("avgBasketSpent", totalSalesAmount/totalSales);
            data.add(map);
        }
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("n_segments", numberOfSegments);
        requestBody.put("customers", data);

        String url = "http://localhost:8000/api/v1/analytics/segment";
        ResponseEntity<List<CustomerSegmentDto>> response = restTemplate.exchange(
                url, HttpMethod.POST, new HttpEntity<>(requestBody),
                new ParameterizedTypeReference<List<CustomerSegmentDto>>() {}
        );
        List<CustomerSegmentDto> segments = response.getBody();

        for(CustomerSegmentDto segment : segments) {
            for(Long usersId: segment.getCustomerIds()){
                usersService.updateUsersSegment(usersId, segment.getSegmentName());
            }
        }

        return response.getBody();
    }

    @Override
    public List<ReviewsSentimentAnalysisDto> analyzeSentiment() {
        List<ProductDto> productDtoList = productService.listProducts();
        List<Map<String, Object>> productsData = new ArrayList<>();


        for (ProductDto productDto : productDtoList) {
            Map<String,Object> map = new HashMap<>();
            Long productId = productDto.getId();

            map.put("productId", productId);

            List<String> reviewTexts = reviewsService.getReviewsByProduct(productId)
                                        .stream().map(reviewsDto -> reviewsDto.getComment()).toList();
            map.put("productReviews",  reviewsService.getReviewsByProduct(productId));

            productsData.add(map);
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("products", productsData);

        String url = "http://localhost:8000/api/v1/analytics/analyze-sentiment";

        ResponseEntity<List<ReviewsSentimentAnalysisDto>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(requestBody),
                new ParameterizedTypeReference<List<ReviewsSentimentAnalysisDto>>() {}
        );

        return response.getBody();
    }

    @Override
    public List<ProductDto> getSimilarProductsByProduct(Long productId) {
        String RECO_URL = "http://localhost:8000/api/v1/recommendation/predict";
        Map<String, Long> requestBody = Map.of("product_id", productId);

        // 2. Appeler l'API Python (POST)
        ProductRecommendationsDto response = restTemplate.postForObject(
                RECO_URL,
                requestBody,
                ProductRecommendationsDto.class
        );

        // 3. Vérifier si on a une réponse valide
        if (response == null || response.getRecommendations() == null || response.getRecommendations().isEmpty()) {
            return List.of(); // Pas de recommandation trouvée
        }

        // 4. Récupérer les IDs envoyés par Python (ex: [102, 504])
        List<Long> recommendedIds = response.getRecommendations();

        // 5. Chercher les vrais produits en base de données SQL
        List<ProductDto> products = new ArrayList<>();
        for (Long simiProducts: recommendedIds){
            products.add(productService.getProduct(simiProducts));
        }
        return products;
    }
}
