package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.entities.Category;
import com.ensa.achrafkarim.backend.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findProductByCategory(Category category);
    List<Product> findByPriceBetween(Double minPrice, Double maxPrice);
    List<Product> findAllByOrderByPriceDesc();
    List<Product> findAllByOrderByPriceAsc();
    List<Product> findByStockLessThan(long lowStock);
    // Query for getting the top-selling products
    @Query("SELECT p FROM Product p JOIN p.soldProducts sp GROUP BY p ORDER BY SUM(sp.quantity) DESC")
    List<Product> getTopSellingProducts(Pageable pageable);
    // Query for getting the least selling products
    @Query("SELECT p FROM Product p JOIN p.soldProducts sp GROUP BY p ORDER BY SUM(sp.quantity) ASC ")
    List<Product> getLeastSellingProducts(Pageable pageable);
    // Query for getting products with 0 sales
    // we used coalesce to check also for products that their sold product table is not existent (null)
    @Query("SELECT p FROM Product p LEFT JOIN p.soldProducts sp GROUP BY p HAVING COALESCE(SUM(sp.quantity), 0) = 0")
    List<Product> getProductsWithNoSales();
    // Query for getting product revenue
    @Query("SELECT COALESCE(SUM(sp.quantity * sp.unitPrice), 0) FROM Product p JOIN p.soldProducts sp WHERE p.id = :productId")
    double getProductRevenue(Long productId);
    // Query to get products based on to profit
    @Query("SELECT COALESCE(SUM(sp.quantity * sp.unitPrice), 0) FROM Product p JOIN p.soldProducts sp")
    List<Product> getTopProfitProducts(Pageable pageable);
    List<Product> findByStockGreaterThan(Long stock);
    List<Product> findByStockLessThan(Long stock);

    List<Product> findByCategoryIdIn(List<Long> categoryIds);

    Product findByName(String productName);
}
