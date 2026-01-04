package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.dto.analyticsDto.MonthlySalesDto;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.PaymentMethod;
import com.ensa.achrafkarim.backend.enums.Segment;
import com.ensa.achrafkarim.backend.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByUsersId(Long id);
    List<Sale> findAllByStatus(Status status);
    List<Sale> findByDateOfSaleBetween(LocalDateTime start, LocalDateTime end);

    List<Sale> findAllByPaymentMethod(PaymentMethod paymentMethod);

    @Query("""
    SELECT s.dateOfSale, sum (sp.quantity * sp.unitPrice)
    from Sale s
    Join s.soldProducts sp
    group by s.dateOfSale
""")
    List<Object[]> findAllSalesWithTotals();

    @Query("""
        SELECT s.users.id, s.users.username, COUNT(s)
        FROM Sale s
        GROUP BY s.users.id, s.users.username
    """)
    List<Object[]> countSalesByUser();
    @Query("""
    SELECT new com.ensa.achrafkarim.backend.dto.analyticsDto.MonthlySalesDto(
        YEAR(s.dateOfSale),
        MONTH(s.dateOfSale),
        SUM(sp.quantity)
    )
    FROM Sale s
    JOIN s.soldProducts sp
    WHERE sp.product.id = :productId
    GROUP BY YEAR(s.dateOfSale),
             MONTH(s.dateOfSale)
    ORDER BY YEAR(s.dateOfSale),
             MONTH(s.dateOfSale)
""")
    List<MonthlySalesDto> findMonthlySalesByProduct(
            @Param("productId") Long productId
    );

    @Query("""
    SELECT SUM(sp.quantity * sp.unitPrice)
    FROM Sale s
    JOIN s.soldProducts sp
    WHERE sp.product.id = :productId
      AND s.dateOfSale BETWEEN :startDate AND :endDate
    """)
    Double calculateCostOfSales(
            @Param("productId") Long productId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("""
    SELECT
        u.id,
        MAX(s.dateOfSale),
        COUNT(s.id),
        SUM(COALESCE(sp.quantity * sp.unitPrice, 0))
    FROM Sale s
    JOIN s.users u
    JOIN s.soldProducts sp
    WHERE s.status = com.ensa.achrafkarim.backend.enums.Status.COMPLETED
    GROUP BY u.id
""")
    List<Object[]> computeRFMRaw();

    @Query("SELECT COUNT(DISTINCT s.users.id) FROM Sale s WHERE s.dateOfSale < :startDate")
    Long countUsersBeforeDate(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(DISTINCT s.users.id) FROM Sale s WHERE s.dateOfSale < :startDate " +
            "AND s.users.id NOT IN (SELECT DISTINCT s2.users.id FROM Sale s2 " +
            "WHERE s2.dateOfSale BETWEEN :startDate AND :endDate)")
    Long countChurnedUsers(@Param("startDate") LocalDateTime startDate,
                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(DISTINCT s.users.id) FROM Sale s " +
            "WHERE s.dateOfSale BETWEEN :startDate AND :endDate")
    Long countActiveUsersDuringPeriod(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);


    @Query("SELECT COUNT(DISTINCT s.users.id) FROM Sale s WHERE s.dateOfSale <= :endDate")
    Long countUsersByEndDate(@Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(DISTINCT s.users.id) FROM Sale s " +
            "WHERE s.dateOfSale BETWEEN :startDate AND :endDate " +
            "AND s.users.id NOT IN (SELECT DISTINCT s2.users.id FROM Sale s2 WHERE s2.dateOfSale < :startDate)")
    Long countNewUsersDuringPeriod(@Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(DISTINCT s.users.id), " +
            "COUNT(s.id), " +
            "SUM(sp.quantity * sp.unitPrice), " +
            "SUM(sp.quantity) " +
            "FROM Sale s " +
            "JOIN s.soldProducts sp " +
            "WHERE s.users.segment = :segment")
    Object[] analyzeSegmentBehavior(@Param("segment") Segment segment);

    @Query("SELECT s.users.id, " +
            "DATEDIFF(CURRENT_DATE, MAX(s.dateOfSale)), " +
            "COUNT(s.id), " +
            "SUM(sp.quantity * sp.unitPrice) " +
            "FROM Sale s " +
            "JOIN s.soldProducts sp " +
            "GROUP BY s.users.id")
    List<Object[]> findUserPurchaseMetrics();

    @Query("SELECT SUM(sp.quantity * sp.unitPrice), " +
            "COUNT(DISTINCT s.id), " +
            "COUNT(DISTINCT s.users.id), " +
            "SUM(sp.quantity) " +
            "FROM Sale s " +
            "JOIN s.soldProducts sp " +
            "WHERE s.dateOfSale BETWEEN :startDate AND :endDate")
    Object[] calculateRevenueMetrics(@Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(DISTINCT s.users.id) FROM Sale s " +
            "WHERE s.dateOfSale BETWEEN :startDate AND :endDate " +
            "AND s.users.id NOT IN (SELECT DISTINCT s2.users.id FROM Sale s2 WHERE s2.dateOfSale < :startDate)")
    Long countNewCustomers(@Param("startDate") LocalDateTime startDate,
                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(DISTINCT s.users.id) FROM Sale s " +
            "WHERE s.dateOfSale BETWEEN :startDate AND :endDate " +
            "AND s.users.id IN (SELECT DISTINCT s2.users.id FROM Sale s2 WHERE s2.dateOfSale < :startDate)")
    Long countReturningCustomers(@Param("startDate") LocalDateTime startDate,
                                 @Param("endDate") LocalDateTime endDate);

}
