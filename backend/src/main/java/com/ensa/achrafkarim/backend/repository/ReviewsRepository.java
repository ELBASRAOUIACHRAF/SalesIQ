package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.dto.ReviewsDto;
import com.ensa.achrafkarim.backend.entities.Reviews;
import lombok.NonNull;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ReviewsRepository extends JpaRepository<Reviews, Long> {
    List<Reviews> findAllByproductId(Long productId);

    List<Reviews> findAllByusersId(Long usersId);

    List<Reviews> findByRatingBetween(double minRating, double maxRating);

    @Query("SELECT AVG(rev.rating) FROM Reviews rev WHERE rev.product.id = :productId")
    Double findAverageRatingByProductId(Long productId);

    List<Reviews> findByReviewDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Reviews> findByRating(double rating);

    @Query("SELECT rev.rating, COUNT(rev) FROM Reviews rev WHERE rev.product.id = :productId GROUP BY(rev.rating)")
    List<Object[]> getRatingDistributionByProduct(Long productId);

    @Query("SELECT rev FROM Reviews rev WHERE rev.product.id = :productId")
    Page<@NonNull Reviews> getReviewsByProduct(Long productId, Pageable pageable);
    // drna non null lfoq lahaqach iqdar chi product ikun mazal ma anedo hta review w aythrowi l program NullptrExc
}
