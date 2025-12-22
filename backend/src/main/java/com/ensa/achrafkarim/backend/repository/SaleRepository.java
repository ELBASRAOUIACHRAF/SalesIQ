package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.dto.analyticsDto.MonthlySalesDto;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.enums.PaymentMethod;
import com.ensa.achrafkarim.backend.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

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
            FUNCTION('YEAR', s.dateOfSale),
            FUNCTION('MONTH', s.dateOfSale),
            SUM(sp.quantity)
        )
        FROM Sale s
        JOIN s.soldProducts sp
        WHERE sp.product.id = :productId
        GROUP BY FUNCTION('YEAR', s.dateOfSale),
                 FUNCTION('MONTH', s.dateOfSale)
        ORDER BY FUNCTION('YEAR', s.dateOfSale),
                 FUNCTION('MONTH', s.dateOfSale)
    """)
    List<MonthlySalesDto> findMonthlySalesByProduct(
            @Param("productId") Long productId
    );
}
