package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SalesTrendPointDto {
    private LocalDateTime periodStart;

    private Double revenue;
    private long salesCount;
    private long quantitySold;
    private Double averageSaleValue;
}
