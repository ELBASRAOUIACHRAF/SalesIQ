package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductInventoryStatusDto {
    private Long currentStock;
    private Double avgDailySales;
    private Integer daysUntilStockout;
    private String stockStatus;
    private Long recommendedRestock;
    private Double inventoryValue;
}