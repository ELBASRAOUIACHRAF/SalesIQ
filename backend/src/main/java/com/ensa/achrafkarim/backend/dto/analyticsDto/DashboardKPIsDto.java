package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardKPIsDto {
    private Double totalRevenue;
    private Long totalOrders;
    private Long totalCustomers;
    private Long totalProductsSold;
    private Double averageOrderValue;
    private Double revenuePerCustomer;
    private Long newCustomers;
    private Long returningCustomers;
    private Double averageBasketSize;
    private Long totalReviews;
    private Double averageRating;
    private Double conversionRate;
}