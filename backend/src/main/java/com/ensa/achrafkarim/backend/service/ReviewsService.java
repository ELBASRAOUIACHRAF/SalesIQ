package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ReviewsDto;
import jakarta.validation.constraints.NotNull;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface ReviewsService {

    // =====================
    // CORE CRUD OPERATIONS
    // =====================
    List<ReviewsDto> getReviewsByProduct(Long productId);
    List<ReviewsDto> getReviewsByUserId(Long userId);
    ReviewsDto createReview(ReviewsDto reviewsDto, Long productId, Long userId);
    ReviewsDto updateReview(Long reviewId, ReviewsDto reviewsDto);
    void deleteReview(Long reviewId);

    // =====================
    // FILTERING
    // =====================
    List<ReviewsDto> getReviewsByRating(double rating);
    List<ReviewsDto> getReviewsByRatingRange(double minRating, double maxRating);
    Page<@NonNull ReviewsDto> getReviewsByDateRange(LocalDateTime startDate, LocalDateTime endDate, int page, int size);

    // =====================
    // AGGREGATION & STATS
    // =====================
    double getAverageRatingByProduct(Long productId);
    long getReviewCountByProduct(Long productId);
    long getReviewCountByUser(Long userId);
    // the method below is meant to return something like this
    // [
    //  count of 5-star reviews,
    //  count of 4-star reviews,
    //  count of 3-star reviews,
    //  count of 2-star reviews,
    //  count of 1-star reviews
    //  ]
    List<Object[]> getRatingDistributionByProduct(Long productId);

    // =====================
    // PAGINATION & SORTING
    // =====================
    Page<@NonNull ReviewsDto> getReviewsByProduct(Long productId, int page, int size);
    Page<@NonNull ReviewsDto> getRecentReviewsByProduct(Long productId, int page, int size);

    // =====================
    // VALIDATION UTILITIES
    // =====================
    boolean hasUserReviewedProduct(Long userId, Long productId);
    boolean reviewExists(Long reviewId);

    // =====================
    // MODERATION (ADMIN)
    // =====================
    void approveReview(Long reviewId);
    void rejectReview(Long reviewId);
    List<ReviewsDto> getPendingReviews();

    // =====================
    // REVIEWS WITH IMAGES (OPTIONAL)
    // =====================
    List<ReviewsDto> getReviewsWithImages(Long productId);

    // =====================
    // SOFT DELETE
    // =====================
    void softDeleteReview(Long reviewId);
    void restoreDeletedReview(Long reviewId);

    // =====================
    // REPLIES SYSTEM
    // =====================
    ReviewsDto replyToReview(Long reviewId, String replyMessage, Long adminId);
    ReviewsDto updateReviewReply(Long reviewId, String replyMessage);
    void deleteReviewReply(Long reviewId);

    // =====================
    // FEATURED REVIEW
    // =====================
    void setFeaturedReview(Long productId, Long reviewId);
    ReviewsDto getFeaturedReview(Long productId);
}
