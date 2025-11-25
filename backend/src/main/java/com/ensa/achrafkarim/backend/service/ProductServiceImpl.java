package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.entities.Product;
import com.ensa.achrafkarim.backend.mapper.ProductMapper;
import com.ensa.achrafkarim.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    ProductRepository productRepository;
    ProductMapper  productMapper;

    public ProductServiceImpl(ProductRepository productRepository,  ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    @Override
    public ProductDto createProduct(ProductDto productDto) {
        return null;
    }

    @Override
    public List<ProductDto> listProducts() {
        List<Product> productsList = productRepository.findAll();
        List<ProductDto> productDtosList = productsList.stream().map(prod -> productMapper.toDto(prod)).collect(Collectors.toList());
        return productDtosList;
    }

    @Override
    public ProductDto updateProduct(ProductDto productDto) {
        return null;
    }

    @Override
    public void deleteProduct(ProductDto productDto) {

    }

    @Override
    public ProductDto getProduct(ProductDto productDto) {
        return null;
    }
}
