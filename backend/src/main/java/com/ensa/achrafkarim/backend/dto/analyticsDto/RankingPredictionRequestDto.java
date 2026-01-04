package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RankingPredictionRequestDto {
    private Long targetProductId;
    private Integer daysAhead;
    private List<RankingPredictionInputDto> allProducts;
}