package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.ProductOrderInfoDto;
import com.ensa.achrafkarim.backend.dto.SoldProductDto;

import java.util.List;

public interface SoldProductService {

    List<ProductDto> getSoldProductsBySale(Long saleId);
    List<SoldProductDto> getAllSoldProductsBySale(Long saleId);
    double getTotalSalesAmount();
    double getTotalPriceBySale(Long saleId);
    double getProfitByProduct(Long productId);
    SoldProductDto addSoldProduct(Long saleId, ProductOrderInfoDto productOrderInfoDto);
    void deleteSoldProduct(Long soldProductId);
    int getTotalQuantitySoldByProduct(Long productId);
    long getNumberOfTimesSold(Long productId);
    double getProductProfitBySaleProductIds(Long productId, Long saleId); // method we talked abt it earlier

    Double getTotalPriceBySalesUser(Long saleId, Long id);

    List<ProductDto> getSoldProductsBySalesUser(Long saleId, Long id);
}
