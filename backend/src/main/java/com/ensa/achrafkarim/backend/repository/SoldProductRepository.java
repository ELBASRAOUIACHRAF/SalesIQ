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
}
