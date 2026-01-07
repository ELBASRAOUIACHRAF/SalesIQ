package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InventoryMetricsDto {
    private Long totalProducts;
    private Long activeProducts;
    private Long lowStockProducts;
    private Long outOfStockProducts;
    private Double avgStockLevel;
    private Double totalInventoryValue;
}