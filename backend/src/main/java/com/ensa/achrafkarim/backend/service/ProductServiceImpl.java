package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.entities.Category;
import com.ensa.achrafkarim.backend.entities.Product;
import com.ensa.achrafkarim.backend.mapper.ProductMapper;
import com.ensa.achrafkarim.backend.repository.CategoryRepository;
import com.ensa.achrafkarim.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private ProductRepository productRepository;
    private ProductMapper  productMapper;
    private CategoryRepository categoryRepository;

    public ProductServiceImpl(ProductRepository productRepository,  ProductMapper productMapper,   CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public ProductDto createProduct(ProductDto productDto) {
        Product product = productMapper.toEntity(productDto);
        Product productSaved = productRepository.save(product);
        return productMapper.toDto(productSaved);
    }

    @Override
    public List<ProductDto> listProducts() {
        List<Product> productsList = productRepository.findAll();
        List<ProductDto> productDtosList = productsList.stream()
                .map(prod -> productMapper.toDto(prod))
                .collect(Collectors.toList());
        return productDtosList;
    }

    @Override
    public ProductDto updateProduct(ProductDto productDto) {
        Product product = productMapper.toEntity(productDto);
        Product productToUpdate = productRepository.findById(product.getId()).orElse(null);
        if (productToUpdate == null) return null; // si le produit n'existe pas

        productToUpdate.setUpdatedAt(LocalDateTime.now());

        // Mettre à jour tous les champs
        productToUpdate.setName(product.getName());
        productToUpdate.setPrice(product.getPrice());
        productToUpdate.setRating(product.getRating());
        productToUpdate.setReviewsCount(product.getReviewsCount());
        productToUpdate.setAsin(product.getAsin());
        productToUpdate.setDescription(product.getDescription());
        productToUpdate.setMark(product.getMark());
        productToUpdate.setDiscount(product.getDiscount());
        productToUpdate.setImageUrl(product.getImageUrl());
        productToUpdate.setImagesGallery(product.getImagesGallery());
        productToUpdate.setWeight(product.getWeight());
        productToUpdate.setLength(product.getLength());
        productToUpdate.setHeight(product.getHeight());

        Product savedProduct = productRepository.save(productToUpdate);

        return productMapper.toDto(savedProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        Product productToDelete = productRepository.findById(id).orElse(null);
        if (productToDelete == null) return;  // si le produit n'existe pas
        productRepository.deleteById(id);
    }

    @Override
    public ProductDto getProduct(Long id) {
        Product product = productRepository.findById(id).get();
        return productMapper.toDto(product);
    }

    @Override
    public List<ProductDto> getProductsByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId).get();
        if (category == null) return null;  // si le produit n'existe pas
        List<Product> products = productRepository.findProductByCategory(category);
        List<ProductDto> productDtos = products.stream()
                .map(prod -> productMapper.toDto(prod))
                .collect(Collectors.toList());
        return productDtos;
    }
}
