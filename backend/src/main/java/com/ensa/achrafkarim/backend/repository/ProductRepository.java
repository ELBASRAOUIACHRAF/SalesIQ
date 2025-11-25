package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

}
