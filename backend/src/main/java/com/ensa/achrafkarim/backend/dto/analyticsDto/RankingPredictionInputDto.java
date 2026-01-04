package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RankingPredictionInputDto {
    private Long productId;
    private String productName;
    private List<DailySalesDto> historicalSales;
    private Integer daysAhead;
}