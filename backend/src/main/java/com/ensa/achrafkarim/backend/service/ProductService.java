package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    // CRUD
    ProductDto createProduct(ProductDto productDto);
    ProductDto updateProduct(ProductDto productDto);
    void deleteProduct(Long id);
    ProductDto getProduct(Long id);
    List<ProductDto> listProducts();

    // Filtering & Search
    List<ProductDto> searchProducts(String keyword);
    List<ProductDto> filterProducts(String name, Long categoryId, Double minPrice, Double maxPrice);
    List<ProductDto> getProductsByCategory(Long categoryId);

    List<ProductDto> filterProductsByPriceRange(double minPrice, double maxPrice);

    List<ProductDto> getProductsSortedByPrice(boolean ascending);

    // Stock management
    ProductDto increaseStock(Long productId, int quantity);
    ProductDto decreaseStock(Long productId, int quantity);
    boolean isProductInStock(Long productId);
    long getAvailableStock(Long productId);
    boolean isLowStock(Long productId);
    List<ProductDto> getLowStockProducts();

    // Analytics
    List<ProductDto> getBestSellingProducts(int limit);
    List<ProductDto> getLeastSellingProducts(int limit);
    List<ProductDto> getProductsWithNoSales();
    double getProductRevenue(Long productId);
    List<ProductDto> getTopProfitProduct(); // Didicace l youness lacienne mol l idea

    // Availability
    List<ProductDto> getAvailableProducts();
    List<ProductDto> getUnavailableProducts();
    void markProductAsUnavailable(Long id);
    void markProductAsAvailable(Long id);

    // Pagination
    List<ProductDto> listProducts(int page, int size);
    List<ProductDto> searchProducts(String keyword, int page, int size);

    // Bulk operations
    List<ProductDto> createProductsBulk(List<ProductDto> products);
    void deleteProductsBulk(List<Long> productIds);

    // Images
    ProductDto addImageToProduct(Long productId, String imageUrl);
    ProductDto removeImageFromProduct(Long productId, String imageUrl);
}

