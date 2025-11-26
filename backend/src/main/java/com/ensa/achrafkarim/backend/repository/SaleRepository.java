package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.Sale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByUsersId(Long id);
}
