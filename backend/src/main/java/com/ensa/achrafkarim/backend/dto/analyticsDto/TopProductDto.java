package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopProductDto {
    private Long productId;
    private String productName;
    private String categoryName;
    private Double revenue;
    private Long quantitySold;
    private Integer rank;
}