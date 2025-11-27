package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.SoldProductDto;
import com.ensa.achrafkarim.backend.entities.Sale;

import java.util.List;

public interface SoldProductService {

    List<ProductDto> getSoldProductsBySale(Sale sale);
    double getTotalPriceBySale(Long saleId);
    double getProfitByProduct(Long productId);

}
