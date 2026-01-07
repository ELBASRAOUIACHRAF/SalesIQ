package com.ensa.achrafkarim.backend.dto.analyticsDto;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssociationRuleDto {
    private ProductDto productA;
    private ProductDto productB;
    private double support;
    private double confidence;
}
