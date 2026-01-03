package com.ensa.achrafkarim.backend.service.analytics.impl;

import com.ensa.achrafkarim.backend.dto.*;
import com.ensa.achrafkarim.backend.dto.analyticsDto.*;
import com.ensa.achrafkarim.backend.entities.Product;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.entities.SoldProduct;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.Role;
import com.ensa.achrafkarim.backend.enums.analyticsEnum.ProductLifecyclePhase;
import com.ensa.achrafkarim.backend.enums.analyticsEnum.SeasonalityType;
import com.ensa.achrafkarim.backend.enums.analyticsEnum.TimeGranularity;
import com.ensa.achrafkarim.backend.mapper.SaleMapper;
import com.ensa.achrafkarim.backend.repository.ProductRepository;
import com.ensa.achrafkarim.backend.repository.SaleRepository;
import com.ensa.achrafkarim.backend.repository.SoldProductRepository;
import com.ensa.achrafkarim.backend.repository.UsersRepository;
import com.ensa.achrafkarim.backend.service.*;
import com.ensa.achrafkarim.backend.service.analytics.AdvancedAnalyticsService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.cglib.core.Local;
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

    private final UsersRepository usersRepository;
    private final SaleMapper saleMapper;
    private final ProductRepository productRepository;
    private final SoldProductRepository soldProductRepository;
    UsersService  usersService;
    SaleService  saleService;
    ReviewsService  reviewsService;
    SearchHistoryService searchHistoryService;
    SoldProductService  soldProductService;
    ProductService  productService;

    private final FastApiClient fastApiClient;
    private final RestTemplate restTemplate;// ← ADD THIS

    private final UsersServiceImpl usersServiceImpl;


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
    public double calculateCustomerLifetimeValue(Long userId) {
        return 0;
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
