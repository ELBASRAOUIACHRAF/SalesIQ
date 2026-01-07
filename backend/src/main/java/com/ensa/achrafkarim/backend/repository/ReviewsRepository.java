package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.Reviews;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReviewsRepository extends JpaRepository<Reviews, Long> {

    @Query("""
    SELECT r
    FROM Reviews r
    JOIN FETCH r.users
    WHERE r.product.id = :productId
        """)
    List<Reviews> findAllByproductIdWithUser(Long productId);

    List<Reviews> findAllByusersId(Long usersId);

    List<Reviews> findByRatingBetween(double minRating, double maxRating);

    @Query("""
    SELECT COALESCE(AVG(rev.rating), 0)
    FROM Reviews rev
    WHERE rev.product.id = :productId
    """)
    Double findAverageRatingByProductId(Long productId);

    Page<@NonNull Reviews> findByReviewDateBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    List<Reviews> findByRating(double rating);

    @Query("SELECT rev.rating, COUNT(rev) FROM Reviews rev WHERE rev.product.id = :productId GROUP BY(rev.rating)")
    Page<Object[]> getRatingDistributionByProduct(Long productId, Pageable pageable);

    @Query("SELECT rev FROM Reviews rev WHERE rev.product.id = :productId")
    Page<@NonNull Reviews> getReviewsByProduct(Long productId, Pageable pageable);
    // drna non null lfoq lahaqach iqdar chi product ikun mazal ma anedo hta review w aythrowi l program NullptrExc

    @Query("SELECT rev FROM Reviews rev WHERE rev.product.id = :productId ORDER BY rev.reviewDate DESC")
    Page<@NonNull Reviews> getRecentReviewsByProduct(Long productId, Pageable pageable);

    boolean existsByUsersIdAndProductId(Long userId, Long productId);

    boolean existsById(Long reviewId);

    List<Reviews> findAllByproductId(Long productId);

    Optional<Reviews> findByIdAndUsersId(Long reviewId, Long userId);

    void deleteByIdAndUsersId(Long reviewId, Long userId);
}
