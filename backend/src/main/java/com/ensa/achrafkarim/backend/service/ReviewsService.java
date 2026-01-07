package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ReviewsDetailsDto;
import com.ensa.achrafkarim.backend.dto.ReviewsDto;
import jakarta.validation.constraints.NotNull;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface ReviewsService {


    List<ReviewsDto> getAllReviews();

    List<ReviewsDto> getReviewsByProduct(Long productId);

    List<ReviewsDetailsDto> getReviewsByProductWithUsers(Long productId);

    List<ReviewsDto> getReviewsByUserId(Long userId);
    ReviewsDto createReview(ReviewsDto reviewsDto, Long productId, Long userId);
    ReviewsDto updateReview(Long reviewId, ReviewsDto reviewsDto, Long userId);
    void deleteReview(Long reviewId, Long userId);


    List<ReviewsDto> getReviewsByRating(double rating);
    List<ReviewsDto> getReviewsByRatingRange(double minRating, double maxRating);
    Page<@NonNull ReviewsDto> getReviewsByDateRange(LocalDateTime startDate, LocalDateTime endDate, int page, int size);


    double getAverageRatingByProduct(Long productId);
    long getReviewCountByProduct(Long productId);
    long getReviewCountByUser(Long userId);

    Page<Object[]> getRatingDistributionByProduct(Long productId, int page, int size);

    double getAverageRatingByUser(Long userId);

    Page<@NonNull ReviewsDto> getReviewsByProduct(Long productId, int page, int size);
    Page<@NonNull ReviewsDto> getRecentReviewsByProduct(Long productId, int page, int size);

    boolean hasUserReviewedProduct(Long userId, Long productId);
    boolean reviewExists(Long reviewId);
}
