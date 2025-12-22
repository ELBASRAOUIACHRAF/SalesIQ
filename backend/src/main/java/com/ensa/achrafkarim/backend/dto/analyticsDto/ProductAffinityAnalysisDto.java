package com.ensa.achrafkarim.backend.dto.analyticsDto;

import com.ensa.achrafkarim.backend.entities.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductAffinityAnalysisDto {
    private List<ProductPair> frequentProductPairs;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductPair {
        private Product productA;
        private Product productB;
        private int supportCount;
    }
}
