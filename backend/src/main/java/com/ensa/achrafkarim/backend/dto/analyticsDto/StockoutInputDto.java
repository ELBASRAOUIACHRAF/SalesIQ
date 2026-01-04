package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockoutInputDto {
    private Long productId;
    private String productName;
    private Long currentStock;
    private List<DailySalesDto> recentSales;
    private Integer daysAhead;
}