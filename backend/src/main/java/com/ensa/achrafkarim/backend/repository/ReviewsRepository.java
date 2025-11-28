package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.Reviews;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewsRepository extends JpaRepository<Reviews, Long> {
    List<Reviews> findAllByproductId(Long productId);

    List<Reviews> findAllByusersId(Long usersId);

    List<Reviews> findByRatingBetween(double minRating, double maxRating);

    @Query("SELECT AVG(rev.rating) FROM Reviews rev WHERE rev.product.id = :productId")
    Double findAverageRatingByProductId(Long productId);
}
