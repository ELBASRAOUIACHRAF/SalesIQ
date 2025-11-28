package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.SoldProductDto;
import com.ensa.achrafkarim.backend.entities.Product;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.entities.SoldProduct;
import com.ensa.achrafkarim.backend.mapper.ProductMapper;
import com.ensa.achrafkarim.backend.repository.SoldProductRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class SoldProductServiceImpl implements SoldProductService {

    SoldProductRepository soldProductRepository;
    ProductMapper  productMapper;

    @Override
    public List<ProductDto> getSoldProductsBySale(Long saleId) {
        List<SoldProduct> soldOfSale = soldProductRepository.findAllBySaleId(saleId);
        List<Product> productIds = soldOfSale.stream().map(sold -> sold.getProduct()).collect(Collectors.toList());
        return productIds.stream()
                .map(prod -> productMapper.toDto(prod))
                .collect(Collectors.toList());
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

    @Override
    public SoldProductDto addSoldProduct(Long saleId, Long productId, int quantity, Double unitPrice) {
        SoldProduct  soldProduct;
        return null;
    }

    @Override
    public void deleteSoldProduct(Long soldProductId) {

    }

    @Override
    public int getTotalQuantitySoldByProduct(Long productId) {
        return 0;
    }

    @Override
    public long getNumberOfTimesSold(Long productId) {
        return 0;
    }
}
