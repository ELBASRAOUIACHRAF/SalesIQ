package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
