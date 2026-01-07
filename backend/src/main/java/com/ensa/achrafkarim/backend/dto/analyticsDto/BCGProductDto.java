package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BCGProductDto {
    private Long productId;
    private String productName;
    private String categoryName;
    private Double marketShare;
    private Double growthRate;
    private Double revenue;
    private String quadrant;
}