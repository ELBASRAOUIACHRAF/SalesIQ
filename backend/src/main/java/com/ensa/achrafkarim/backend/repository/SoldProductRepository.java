package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.SoldProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SoldProductRepository extends JpaRepository<SoldProduct, Long> {
    List<SoldProduct> findAllBySaleId(Long saleId);
    List<SoldProduct> findAllByProductId(Long productId);
}
