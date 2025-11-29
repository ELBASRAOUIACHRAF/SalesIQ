package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.entities.Category;
import com.ensa.achrafkarim.backend.entities.Product;
import com.ensa.achrafkarim.backend.mapper.ProductMapper;
import com.ensa.achrafkarim.backend.repository.CategoryRepository;
import com.ensa.achrafkarim.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductService productService;
    //private final ProductService productService;
    private ProductRepository productRepository;
    private ProductMapper  productMapper;
    private CategoryRepository categoryRepository;
    private FileStorageService fileStorageService;
    @Value("${stock.low.lowStock}")
    private int lowStock;

    public ProductServiceImpl(ProductRepository productRepository, ProductMapper productMapper, CategoryRepository categoryRepository, ProductService productService) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.categoryRepository = categoryRepository;

        //this.productService = productService;
        this.productService = productService;
    }

    @Override
    public ProductDto createProduct(ProductDto productDto) {
        Product product = productMapper.toEntity(productDto);
        product.setIsActive(true);
        product.setReviewsCount(0L);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        Product productSaved = productRepository.save(product);
        return productMapper.toDto(productSaved);
    }

    @Override
    public List<ProductDto> listProducts() {
        List<Product> productsList = productRepository.findAll();
        return (productsList.stream()
                .map(prod -> productMapper.toDto(prod))
                .collect(Collectors.toList()));
    }

    @Override
    public List<ProductDto> searchProducts(String keyword) {
        return List.of();
    }

    @Override
    public List<ProductDto> filterProducts(String name, Long categoryId, Double minPrice, Double maxPrice) {
        return List.of();
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
        return (productMapper.toDto(productRepository.findById(id).orElse(null)));
    }

    @Override
    public List<ProductDto> getProductsByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId).orElse(null);
        if (category == null) return null;  // si le produit n'existe pas
        List<Product> products = productRepository.findProductByCategory(category);
        return products.stream()
                .map(prod -> productMapper.toDto(prod))
                .collect(Collectors.toList());
    }

    @Override
    public ProductDto increaseStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return null;
        product.setStock(product.getStock() + quantity);
        productRepository.save(product);
        return productMapper.toDto(product);
    }

    @Override
    public ProductDto decreaseStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return null;
        if (product.getStock() < quantity) return null; // quantite insufisante erreur
        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
        return productMapper.toDto(product); // jps ps kayn lach n returniw tani
    }

    @Override
    public List<ProductDto> filterProductsByPriceRange(double minPrice, double maxPrice) {
        List<Product> productList = productRepository.findByPriceBetween(minPrice, maxPrice);
        return (productList.stream()
                .map(product -> productMapper.toDto(product))
                .collect(Collectors.toList()));
    }

    @Override
    public List<ProductDto> getProductsSortedByPrice(boolean ascending) {
        List<Product> product = null;
        if(ascending) {
            product = productRepository.findAllByOrderByPriceAsc();
        }else {
            product = productRepository.findAllByOrderByPriceDesc();
        }
        List<ProductDto> productDtos = product.stream()
                .map(prod -> productMapper.toDto(prod))
                .collect(Collectors.toList());
        return productDtos;
    }

    @Override
    public boolean isProductInStock(Long productId) {
        return productRepository.findById(productId)
                .map(product -> product.getStock() != 0)
                .orElse(false);
    }

    @Override
    public long getAvailableStock(Long productId) {
        return productRepository.findById(productId)
                .map(Product::getStock).orElse(0L);
    }

    @Override
    // I defined what a low stock is in the app's properties
    public boolean isLowStock(Long productId) {
        return (this.getAvailableStock(productId) < this.lowStock);
    }

    @Override
    public List<ProductDto> getLowStockProducts() {
        // look in the jpa repository
        return productRepository.findByStockLessThan(this.lowStock)
                .stream()
                .map(product -> productMapper.toDto(product))
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> getBestSellingProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.getTopSellingProducts(pageable).stream()
                                .map(product -> productMapper.toDto(product))
                                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> getLeastSellingProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.getLeastSellingProducts(pageable).stream()
                .map(product -> productMapper.toDto(product))
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> getProductsWithNoSales() {
        return productRepository.getProductsWithNoSales().stream()
                .map(product -> productMapper.toDto(product))
                .collect(Collectors.toList());
    }

    @Override
    public double getProductRevenue(Long productId) {
        return productRepository.getProductRevenue(productId);
    }

    @Override
    public List<ProductDto> getTopProfitProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.getTopProfitProducts(pageable).stream()
                .map(product -> productMapper.toDto(product))
                .collect(Collectors.toList());


    }

    @Override
    public List<ProductDto> getAvailableProducts() {
        return productRepository.findByStockGreaterThan(0L).stream()
                .map(product -> productMapper.toDto(product))
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> getUnavailableProducts() {
        return productRepository.findByStockLessThan(0L).stream()
                .map(product -> productMapper.toDto(product))
                .collect(Collectors.toList());
    }

    @Override
    public ProductDto markProductAsUnavailable(ProductDto productDto) {
        Product product = productMapper.toEntity(productDto);
        Product productUpdated = productRepository.findById(product.getId()).orElse(null);
        if (productUpdated == null) return null; // si le produit n'existe pas
        productUpdated.setUpdatedAt(LocalDateTime.now());
        productUpdated.setIsActive(false);
        productRepository.save(productUpdated);
        return productMapper.toDto(productUpdated);
    }

    @Override
    public ProductDto markProductAsAvailable(ProductDto productDto) {
        Product product = productMapper.toEntity(productDto);
        Product productUpdated = productRepository.findById(product.getId()).orElse(null);
        if (productUpdated == null) return null; // si le produit n'existe pas
        productUpdated.setUpdatedAt(LocalDateTime.now());
        productUpdated.setIsActive(true);
        productRepository.save(productUpdated);
        return productMapper.toDto(productUpdated);
    }

    @Override
    public ProductDto addImageToProduct(Long productId, MultipartFile file) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        String imageUrl = fileStorageService.saveImage(file);

        // ajouter l’URL à la liste
        product.getImagesGallery().add(imageUrl);

        productRepository.save(product);
        return productMapper.toDto(product);
    }

    @Override
    public ProductDto removeImageFromProduct(Long productId, String imageUrl) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return null;

        // Supprimer l’URL de la liste
        product.getImagesGallery().remove(imageUrl);

        productRepository.save(product);
        return productMapper.toDto(product);
    }
}
