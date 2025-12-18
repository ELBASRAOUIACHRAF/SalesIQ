package com.ensa.achrafkarim.backend.service.analytics.impl;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.dto.analyticsDto.*;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.entities.SoldProduct;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.Role;
import com.ensa.achrafkarim.backend.enums.analyticsEnum.SeasonalityType;
import com.ensa.achrafkarim.backend.enums.analyticsEnum.TimeGranularity;
import com.ensa.achrafkarim.backend.repository.SaleRepository;
import com.ensa.achrafkarim.backend.service.*;
import com.ensa.achrafkarim.backend.service.analytics.AdvancedAnalyticsService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@Data
@AllArgsConstructor
public class AdvancedAnalyticsServiceImpl implements AdvancedAnalyticsService {

    private final SaleRepository saleRepository;
    UsersService  usersService;
    SaleService  saleService;
    ReviewsService  reviewsService;
    SearchHistoryService searchHistoryService;
    SoldProductService  soldProductService;
    ProductService  productService;


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


    @Override
    public double calculateCustomerLifetimeValue(Long userId) {
        return 0;
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

        return List.of();
    }

    @Override
    public List<ReviewsSentimentAnalysisDto> analyzeSentiment() {
        List<ProductDto> productDtoList = productService.listProducts();

        List<Map>  data = new ArrayList<>();
        for (ProductDto productDto : productDtoList) {
            Map<String,Object> map = new HashMap<>();
            Long productId = productDto.getId();

            map.put("productId", productId);
            map.put("productReviews",  reviewsService.getReviewsByProduct(productId));

            data.add(map);
        }

        return null;
    }
}
