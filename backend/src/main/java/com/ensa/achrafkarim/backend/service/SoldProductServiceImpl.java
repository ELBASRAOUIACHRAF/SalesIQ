package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.ProductOrderInfoDto;
import com.ensa.achrafkarim.backend.dto.SoldProductDto;
import com.ensa.achrafkarim.backend.entities.Product;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.entities.SoldProduct;
import com.ensa.achrafkarim.backend.mapper.ProductMapper;
import com.ensa.achrafkarim.backend.mapper.SoldProductMapper;
import com.ensa.achrafkarim.backend.repository.ProductRepository;
import com.ensa.achrafkarim.backend.repository.SaleRepository;
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
    ProductRepository  productRepository;
    SaleRepository   saleRepository;
    SoldProductMapper soldProductMapper;
    ProductService productService;

    @Override
    public List<ProductDto> getSoldProductsBySale(Long saleId) {
        List<SoldProduct> soldOfSale = soldProductRepository.findAllBySaleId(saleId);
        List<Product> productIds = soldOfSale.stream().map(sold -> sold.getProduct()).collect(Collectors.toList());
        return productIds.stream()
                .map(prod -> productMapper.toDto(prod))
                .collect(Collectors.toList());
    }

    @Override
    public List<SoldProductDto> getAllSoldProductsBySale(Long saleId) {
        List<SoldProduct> soldProductList = soldProductRepository.findAllBySaleId(saleId);
        return soldProductList.stream()
                .map(sol -> soldProductMapper.toDto(sol))
                .collect(Collectors.toList());
    }

    @Override
    public double getTotalSalesAmount() {
        List<SoldProduct> soldProductList = soldProductRepository.findAll();
        double totalAmount = 0;
        for (SoldProduct soldProduct : soldProductList) {
            totalAmount +=  soldProduct.getUnitPrice()*soldProduct.getQuantity();
        }
        return totalAmount;
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
        if (productRepository.findById(productId)==null) return 0;
        List<SoldProduct> soldOfProduct = soldProductRepository.findAllByProductId(productId);
        double totalPrice = 0;
        for (SoldProduct sold : soldOfProduct) {
            totalPrice += sold.getUnitPrice()*sold.getQuantity();
        }
        return totalPrice;
    }

    @Override
    public SoldProductDto addSoldProduct(Long saleId, ProductOrderInfoDto productOrderInfoDto) {
        SoldProduct  soldProduct = new SoldProduct();
        soldProduct.setUnitPrice(productOrderInfoDto.getUnitPrice());// pour le discount "est ce que on doit sauvgarder le prix aprés le discount ou avant"
        soldProduct.setQuantity(productOrderInfoDto.getQuantity());
        soldProduct.setProduct(productRepository.findById(productOrderInfoDto.getProductId()).get());
        soldProduct.setSale(saleRepository.findById(saleId).get());
        productService.decreaseStock(productOrderInfoDto.getProductId(), productOrderInfoDto.getQuantity());
        SoldProduct savedSoldProduct = soldProductRepository.save(soldProduct);
        return soldProductMapper.toDto(savedSoldProduct);
    }

    @Override
    public void deleteSoldProduct(Long soldProductId) {
        if (soldProductRepository.findById(soldProductId)==null) return ;
        soldProductRepository.deleteById(soldProductId);
    }

    @Override
    public int getTotalQuantitySoldByProduct(Long productId) {
        if (productRepository.findById(productId)==null) return 0;
        List<SoldProduct> soldOfProduct = soldProductRepository.findAllByProductId(productId);
        int totalQuantity = 0;
        for (SoldProduct sold : soldOfProduct) {
            totalQuantity += sold.getQuantity();
        }
        return totalQuantity;
    }

    @Override
    public long getNumberOfTimesSold(Long productId) {
        if (productRepository.findById(productId)==null) return 0;
        List<SoldProduct> soldOfProduct = soldProductRepository.findAllByProductId(productId);
        return soldOfProduct.size();
    }

    @Override
    public double getProductProfitBySaleProductIds(Long saleId, Long productId) {
        SoldProduct soldProduct = soldProductRepository.findBySaleIdAndProductId(saleId, productId).orElse(null);
        if (soldProduct == null) return 0;
        return (soldProduct.getUnitPrice()*soldProduct.getQuantity());
    }

    @Override
    public Double getTotalPriceBySalesUser(Long saleId, Long id) {
        List<SoldProduct> soldOfSale = soldProductRepository.findAllBySaleIdAndUsersId(saleId, id);
        double totalPrice = 0;
        for (SoldProduct sold : soldOfSale) {
            totalPrice += sold.getUnitPrice()*sold.getQuantity();
        }
        return totalPrice;
    }

    @Override
    public List<ProductDto> getSoldProductsBySalesUser(Long saleId, Long id) {
        List<SoldProduct> soldOfSale = soldProductRepository.findAllBySaleIdAndUsersId(saleId, id);
        List<Product> productIds = soldOfSale.stream().map(sold -> sold.getProduct()).collect(Collectors.toList());
        return productIds.stream()
                .map(prod -> productMapper.toDto(prod))
                .collect(Collectors.toList());
    }
}
