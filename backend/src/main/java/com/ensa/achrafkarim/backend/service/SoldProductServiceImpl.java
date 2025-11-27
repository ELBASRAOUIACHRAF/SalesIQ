package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.SoldProductDto;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.entities.SoldProduct;
import com.ensa.achrafkarim.backend.repository.SoldProductRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class SoldProductServiceImpl implements SoldProductService {

    SoldProductRepository soldProductRepository;

    @Override
    public List<ProductDto> getSoldProductsBySale(Sale sale) {
        return List.of();
    }

    @Override
    public double getTotalPriceBySale(Long saleId) {
        List<SoldProduct> soldOfSale = soldProductRepository.findAllBySaleId(saleId);
        double totalPrice = 0;
        for (SoldProduct sold : soldOfSale) {
            totalPrice += sold.getUnitPrice()*sold.getQuantity();
        }
        return totalPrice;
    }

    @Override
    public double getProfitByProduct(Long productId) {
        List<SoldProduct> soldOfProduct = soldProductRepository.findAllByProductId(productId);
        double totalPrice = 0;
        for (SoldProduct sold : soldOfProduct) {
            totalPrice += sold.getUnitPrice()*sold.getQuantity();
        }
        return totalPrice;
    }
}
