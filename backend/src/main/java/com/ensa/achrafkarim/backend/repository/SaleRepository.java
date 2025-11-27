package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.enums.PaymentMethod;
import com.ensa.achrafkarim.backend.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByUsersId(Long id);
    List<Sale> findAllByStatus(Status status);
    List<Sale> findByDateOfSaleBetween(LocalDateTime start, LocalDateTime end);

    List<Sale> findAllByPaymentMethod(PaymentMethod paymentMethod);
}
