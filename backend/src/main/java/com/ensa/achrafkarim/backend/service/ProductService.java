package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProductDto;

import java.util.List;

public interface ProductService {

    ProductDto createProduct(ProductDto productDto);
    List<ProductDto> listProducts();
    ProductDto updateProduct(ProductDto productDto);
    void deleteProduct(ProductDto productDto);
    ProductDto getProduct(ProductDto productDto);


}
