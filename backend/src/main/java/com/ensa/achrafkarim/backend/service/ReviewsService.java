package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ReviewsDto;
import com.ensa.achrafkarim.backend.entities.Reviews;

import java.time.LocalDateTime;
import java.util.List;

public interface ReviewsService {
    List<ReviewsDto> getReviewsByProduct(Long productId);
    List<ReviewsDto> getReviewsByUserId(Long userId);

    ReviewsDto createReview(ReviewsDto reviewsDto, Long productId, Long userId);
    ReviewsDto updateReview(Long reviewId, ReviewsDto reviewsDto);
    void deleteReview(Long reviewId);
    List<ReviewsDto> getReviewsByRating(double rating);
    List<ReviewsDto> getReviewsByRatingRange(double minRating, double maxRating);
    List<ReviewsDto> getReviewsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    double getAverageRatingByProduct(Long productId);
    long getReviewCountByProduct(Long productId);
    long getReviewCountByUser(Long userId);
}
