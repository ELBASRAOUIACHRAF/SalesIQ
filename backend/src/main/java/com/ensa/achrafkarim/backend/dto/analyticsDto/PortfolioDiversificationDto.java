package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioDiversificationDto {
    private Integer categoryCount;
    private Double categoryConcentration;
    private Double priceRangeSpread;
    private Double minPrice;
    private Double maxPrice;
    private Double avgPrice;
    private String diversificationLevel;
}