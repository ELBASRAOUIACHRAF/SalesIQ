package com.ensa.achrafkarim.backend.dto.analyticsDto;

import com.ensa.achrafkarim.backend.enums.analyticsEnum.ProductLifecyclePhase;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductLifecycleDto {
    private Long productId;
    private ProductLifecyclePhase phase;

    private double avgMonthlySales;
    private double salesGrowth;
}
