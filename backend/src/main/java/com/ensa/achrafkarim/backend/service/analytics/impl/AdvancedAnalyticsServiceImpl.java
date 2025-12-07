package com.ensa.achrafkarim.backend.service.analytics.impl;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.dto.analyticsDto.CustomerSegmentDto;
import com.ensa.achrafkarim.backend.dto.analyticsDto.ReviewsSentimentAnalysisDto;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.Role;
import com.ensa.achrafkarim.backend.service.*;
import com.ensa.achrafkarim.backend.service.analytics.AdvancedAnalyticsService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@Data
@AllArgsConstructor
public class AdvancedAnalyticsServiceImpl implements AdvancedAnalyticsService {

    UsersService  usersService;
    SaleService  saleService;
    ReviewsService  reviewsService;
    SearchHistoryService searchHistoryService;
    SoldProductService  soldProductService;
    ProductService  productService;


    @Override
    public double calculateCustomerLifetimeValue(Long userId) {
        return 0;
    }

    @Override
    public double calculateROI(Long campaignId) {
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
