package com.ensa.achrafkarim.backend.service.analytics.impl;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.dto.analyticsDto.CustomerSegmentDto;
import com.ensa.achrafkarim.backend.dto.analyticsDto.ReviewsSentimentAnalysisDto;
import com.ensa.achrafkarim.backend.dto.analyticsDto.SalesTrendAnalysisDto;
import com.ensa.achrafkarim.backend.dto.analyticsDto.SalesTrendPointDto;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.entities.SoldProduct;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.Role;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
