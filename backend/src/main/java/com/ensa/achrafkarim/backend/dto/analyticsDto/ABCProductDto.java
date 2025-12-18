package com.ensa.achrafkarim.backend.dto.analyticsDto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ABCProductDto {

    private Long productId;
    private String productName;

    private double revenue;
    private double revenuePercentage;
    private double cumulativePercentage;

    private char abcClass;
}

