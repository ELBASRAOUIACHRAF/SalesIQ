package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.Reviews;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

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

    @Query("SELECT COUNT(r.id), AVG(r.rating) FROM Reviews r " +
            "WHERE r.reviewDate BETWEEN :startDate AND :endDate")
    Object[] calculateReviewMetrics(@Param("startDate") LocalDateTime startDate,
                                    @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(r), AVG(r.rating), MAX(r.reviewDate), " +
            "SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) " +
            "FROM Reviews r WHERE r.product.id = :productId")
    Object[] findProductReviewMetrics(@Param("productId") Long productId);


    @Query("SELECT AVG(r.rating), COUNT(r.id), " +
            "SUM(CASE WHEN r.rating >= 4 THEN 1 ELSE 0 END) " +
            "FROM Reviews r " +
            "WHERE r.reviewDate BETWEEN :startDate AND :endDate")
    Object[] findReviewMetrics(@Param("startDate") LocalDateTime startDate,
                               @Param("endDate") LocalDateTime endDate);


    @Query("SELECT r.id, r.comment, r.rating FROM Reviews r " +
            "WHERE r.product.id = :productId AND r.comment IS NOT NULL AND r.comment <> ''")
    List<Object[]> findReviewTextsByProduct(@Param("productId") Long productId);
}
