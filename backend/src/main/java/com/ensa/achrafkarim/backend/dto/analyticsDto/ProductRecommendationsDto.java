package com.ensa.achrafkarim.backend.dto.analyticsDto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRecommendationsDto {
    @JsonProperty("product_id")
    private Long productId;

    @JsonProperty("recommendations")
    private List<Long> recommendations;
}