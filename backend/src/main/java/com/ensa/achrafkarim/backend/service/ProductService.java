package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProductDto;

import java.util.List;

public interface ProductService {

    ProductDto createProduct(ProductDto productDto);
    List<ProductDto> listProducts();
    ProductDto updateProduct(ProductDto productDto);
    void deleteProduct(Long id);
    ProductDto getProduct(Long id);
    List<ProductDto> getProductsByCategory(Long categoryId);
    ProductDto increaseStock(Long productId, int quantity);
    ProductDto decreaseStock(Long productId, int quantity);
    List<ProductDto> filterProductsByPriceRange(double minPrice, double maxPrice);
    List<ProductDto> getProductsSortedByPrice(boolean ascending);
    boolean isProductInStock(Long productId);
    int getAvailableStock(Long productId);
}
