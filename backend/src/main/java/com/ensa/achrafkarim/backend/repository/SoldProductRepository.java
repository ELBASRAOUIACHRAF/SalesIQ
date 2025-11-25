package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.SoldProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SoldProductRepository extends JpaRepository<SoldProduct, Long> {
}
