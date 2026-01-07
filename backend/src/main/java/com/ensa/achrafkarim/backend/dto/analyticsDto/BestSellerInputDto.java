package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BestSellerInputDto {
    private Long productId;
    private String productName;
    private String categoryName;
    private Integer totalReviews;
    private Double avgRating;
    private Integer daysOnMarket;
    private List<DailySalesDto> recentSales;
}