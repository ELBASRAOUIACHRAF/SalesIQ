package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.SoldProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SoldProductRepository extends JpaRepository<SoldProduct, Long> {
    List<SoldProduct> findAllBySaleId(Long saleId);
    List<SoldProduct> findAllByProductId(Long productId);
    Optional<SoldProduct> findBySaleIdAndProductId(Long saleId, Long productId);
    @Query("""
        SELECT 
            c.id,
            c.name,
            SUM(sp.quantity),
            SUM(sp.quantity * sp.unitPrice),
            COUNT(DISTINCT s.id)
        FROM SoldProduct sp
        JOIN sp.sale s
        JOIN sp.product p
        JOIN p.category c
        WHERE s.dateOfSale BETWEEN :startDate AND :endDate
          AND s.status = 'COMPLETED'
        GROUP BY c.id, c.name
        ORDER BY SUM(sp.quantity * sp.unitPrice) DESC
    """)
    List<Object[]> analyzeCategoryPerformance(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("""
        SELECT 
            p.id,
            p.name,
            SUM(sp.quantity * sp.unitPrice),
            SUM(sp.quantity * p.price)
        FROM SoldProduct sp
        JOIN sp.product p
        JOIN sp.sale s
        WHERE s.status = 'COMPLETED'
        GROUP BY p.id, p.name
    """)
    List<Object[]> analyzeProfitMargins();

    @Query("""
        SELECT 
            AVG(p.discount),
            SUM(sp.quantity),
            SUM(sp.quantity * sp.unitPrice)
        FROM SoldProduct sp
        JOIN sp.product p
        JOIN sp.sale s
        WHERE s.status = 'COMPLETED'
          AND p.discount > 0
    """)
    Object[] analyzePromotionImpact();


    @Query("SELECT CAST(s.dateOfSale AS LocalDate), SUM(sp.quantity * sp.unitPrice) " +
            "FROM SoldProduct sp " +
            "JOIN sp.sale s " +
            "WHERE sp.product.id = :productId " +
            "GROUP BY CAST(s.dateOfSale AS LocalDate) " +
            "ORDER BY CAST(s.dateOfSale AS LocalDate)")
    List<Object[]> findDailySalesByProduct(@Param("productId") Long productId);

    @Query("SELECT sp.product.id, sp.product.name, SUM(sp.quantity * sp.unitPrice) " +
            "FROM SoldProduct sp " +
            "JOIN sp.sale s " +
            "GROUP BY sp.product.id, sp.product.name " +
            "ORDER BY SUM(sp.quantity * sp.unitPrice) DESC")
    List<Object[]> findAllProductsWithTotalSales();


    @Query("SELECT sp.product.id, " +
            "sp.product.name, " +
            "sp.product.category.name, " +
            "COUNT(r.id), " +
            "AVG(r.rating), " +
            "sp.product.createdAt " +
            "FROM SoldProduct sp " +
            "JOIN sp.product p " +
            "LEFT JOIN p.reviewsList r " +
            "GROUP BY sp.product.id, sp.product.name, sp.product.category.name, sp.product.createdAt")
    List<Object[]> findProductMetricsForBestSeller();

    @Query("SELECT CAST(s.dateOfSale AS LocalDate), SUM(sp.quantity * sp.unitPrice) " +
            "FROM SoldProduct sp " +
            "JOIN sp.sale s " +
            "WHERE sp.product.id = :productId " +
            "AND s.dateOfSale >= :startDate " +
            "GROUP BY CAST(s.dateOfSale AS LocalDate) " +
            "ORDER BY CAST(s.dateOfSale AS LocalDate)")
    List<Object[]> findRecentSalesByProduct(@Param("productId") Long productId,
                                            @Param("startDate") LocalDateTime startDate);


    @Query("SELECT p.id, p.name, p.stock " +
            "FROM Product p " +
            "WHERE p.isActive = true")
    List<Object[]> findAllActiveProductsWithStock();

    @Query("SELECT CAST(s.dateOfSale AS LocalDate), SUM(sp.quantity) " +
            "FROM SoldProduct sp " +
            "JOIN sp.sale s " +
            "WHERE sp.product.id = :productId " +
            "AND s.dateOfSale >= :startDate " +
            "GROUP BY CAST(s.dateOfSale AS LocalDate) " +
            "ORDER BY CAST(s.dateOfSale AS LocalDate)")
    List<Object[]> findDailyQuantitySoldByProduct(@Param("productId") Long productId,
                                                  @Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(sp.quantity * sp.unitPrice), SUM(sp.quantity), COUNT(DISTINCT sp.sale.id) " +
            "FROM SoldProduct sp WHERE sp.product.id = :productId")
    Object[] findProductSalesMetrics(@Param("productId") Long productId);

    @Query("SELECT SUM(sp.quantity * sp.unitPrice) FROM SoldProduct sp " +
            "JOIN sp.sale s WHERE sp.product.id = :productId " +
            "AND s.dateOfSale >= :startDate")
    Double findProductRevenueSince(@Param("productId") Long productId,
                                   @Param("startDate") LocalDateTime startDate);

    @Query("SELECT CAST(s.dateOfSale AS LocalDate), SUM(sp.quantity * sp.unitPrice) " +
            "FROM SoldProduct sp JOIN sp.sale s " +
            "WHERE sp.product.id = :productId " +
            "GROUP BY CAST(s.dateOfSale AS LocalDate) " +
            "ORDER BY CAST(s.dateOfSale AS LocalDate)")
    List<Object[]> findProductSalesHistory(@Param("productId") Long productId);

    @Query("SELECT AVG(sp.quantity) FROM SoldProduct sp " +
            "JOIN sp.sale s WHERE sp.product.id = :productId " +
            "AND s.dateOfSale >= :startDate")
    Double findAvgDailySales(@Param("productId") Long productId,
                             @Param("startDate") LocalDateTime startDate);

    @Query("SELECT p.id, p.name, p.price, SUM(sp.quantity * sp.unitPrice), " +
            "AVG(r.rating), SUM(sp.quantity) " +
            "FROM Product p " +
            "LEFT JOIN p.soldProducts sp " +
            "LEFT JOIN p.reviewsList r " +
            "WHERE p.category.id = :categoryId AND p.isActive = true " +
            "GROUP BY p.id, p.name, p.price " +
            "ORDER BY SUM(sp.quantity * sp.unitPrice) DESC NULLS LAST")
    List<Object[]> findCategoryCompetitors(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(DISTINCT sp.product.id) + 1 FROM SoldProduct sp " +
            "WHERE (SELECT SUM(sp2.quantity * sp2.unitPrice) FROM SoldProduct sp2 WHERE sp2.product.id = sp.product.id) > " +
            "(SELECT SUM(sp3.quantity * sp3.unitPrice) FROM SoldProduct sp3 WHERE sp3.product.id = :productId)")
    Integer findOverallRank(@Param("productId") Long productId);

    @Query("SELECT SUM(sp.quantity * sp.unitPrice) FROM SoldProduct sp")
    Double findTotalRevenue();

    @Query("SELECT SUM(sp.quantity * sp.unitPrice) FROM SoldProduct sp " +
            "WHERE sp.product.category.id = :categoryId")
    Double findCategoryTotalRevenue(@Param("categoryId") Long categoryId);


    @Query("SELECT p.id, p.name, p.category.name, p.price, " +
            "SUM(sp.quantity * sp.unitPrice), SUM(sp.quantity), " +
            "AVG(r.rating), p.stock, p.isActive " +
            "FROM Product p " +
            "LEFT JOIN p.soldProducts sp " +
            "LEFT JOIN p.reviewsList r " +
            "GROUP BY p.id, p.name, p.category.name, p.price, p.stock, p.isActive " +
            "ORDER BY SUM(sp.quantity * sp.unitPrice) DESC NULLS LAST")
    List<Object[]> findAllProductsPortfolioData();

    @Query("SELECT p.category.id, p.category.name, COUNT(p.id), " +
            "SUM(sp.quantity * sp.unitPrice), AVG(p.price), AVG(r.rating), SUM(sp.quantity) " +
            "FROM Product p " +
            "LEFT JOIN p.soldProducts sp " +
            "LEFT JOIN p.reviewsList r " +
            "WHERE p.category IS NOT NULL " +
            "GROUP BY p.category.id, p.category.name " +
            "ORDER BY SUM(sp.quantity * sp.unitPrice) DESC NULLS LAST")
    List<Object[]> findCategoryPortfolioData();

    @Query("SELECT p.id, SUM(sp.quantity * sp.unitPrice) " +
            "FROM Product p " +
            "JOIN p.soldProducts sp " +
            "JOIN sp.sale s " +
            "WHERE s.dateOfSale >= :startDate " +
            "GROUP BY p.id")
    List<Object[]> findProductRevenueSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT p.category.id, SUM(sp.quantity * sp.unitPrice) " +
            "FROM Product p " +
            "JOIN p.soldProducts sp " +
            "JOIN sp.sale s " +
            "WHERE s.dateOfSale >= :startDate AND p.category IS NOT NULL " +
            "GROUP BY p.category.id")
    List<Object[]> findCategoryRevenueSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(sp.quantity) FROM SoldProduct sp " +
            "JOIN sp.sale s WHERE s.dateOfSale BETWEEN :startDate AND :endDate")
    Long countUnitsSoldInPeriod(@Param("startDate") LocalDateTime startDate,
                                @Param("endDate") LocalDateTime endDate);



    @Query("SELECT sp FROM SoldProduct sp WHERE sp.sale.id = :saleId AND sp.sale.users.id = :userId")
    List<SoldProduct> findAllBySaleIdAndUsersId(@Param("saleId") Long saleId, @Param("userId") Long userId);
}
