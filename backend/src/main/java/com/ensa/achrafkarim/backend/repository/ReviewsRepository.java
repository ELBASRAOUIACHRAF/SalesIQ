package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.Reviews;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewsRepository extends JpaRepository<Reviews, Long> {
}
