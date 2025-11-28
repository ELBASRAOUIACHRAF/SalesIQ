package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.Reviews;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewsRepository extends JpaRepository<Reviews, Long> {
    List<Reviews> findAllByproductId(Long productId);

    List<Reviews> findAllByusersId(Long usersId);
}
