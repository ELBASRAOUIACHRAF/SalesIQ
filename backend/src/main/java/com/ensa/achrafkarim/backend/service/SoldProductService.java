package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.SoldProductDto;
import com.ensa.achrafkarim.backend.entities.Sale;

import java.util.List;

public interface SoldProductService {

    List<ProductDto> getSoldProductsBySale(Long saleId);
    double getTotalPriceBySale(Long saleId);
    double getProfitByProduct(Long productId);
    SoldProductDto addSoldProduct(Long saleId, Long productId, int quantity, Double unitPrice);
    void deleteSoldProduct(Long soldProductId);
    int getTotalQuantitySoldByProduct(Long productId);
    long getNumberOfTimesSold(Long productId);

}
