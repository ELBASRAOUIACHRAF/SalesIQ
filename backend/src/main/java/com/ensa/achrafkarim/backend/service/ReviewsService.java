package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ReviewsDto;
import jakarta.validation.constraints.NotNull;
import lombok.NonNull;
import org.springframework.data.domain.Page;

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
    List<ReviewsDto> getReviewsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

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
    Page<@NonNull ReviewsDto> getSortedReviewsByProduct(Long productId, String sortBy, String direction);

    // =====================
    // VALIDATION UTILITIES
    // =====================
    boolean hasUserReviewedProduct(Long userId, Long productId);
    boolean reviewExists(Long reviewId);

    // =====================
    // HELPFUL / VOTES SYSTEM
    // =====================
    void markReviewHelpful(Long reviewId, Long userId);
    void markReviewNotHelpful(Long reviewId, Long userId);
    int getHelpfulCount(Long reviewId);
    int getNotHelpfulCount(Long reviewId);

    // =====================
    // ADVANCED ANALYTICS
    // =====================
    ReviewsDto getMostHelpfulReviewForProduct(Long productId);
    ReviewsDto getLatestReviewForProduct(Long productId);

    // =====================
    // SEARCH & COMBINED FILTER
    // =====================
    List<ReviewsDto> searchReviews(String keyword);
    List<ReviewsDto> filterReviews(Long productId, Double rating, LocalDateTime dateMin, LocalDateTime dateMax);

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
