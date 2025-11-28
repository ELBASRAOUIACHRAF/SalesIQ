package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ReviewsDto;
import com.ensa.achrafkarim.backend.entities.Reviews;
import com.ensa.achrafkarim.backend.mapper.ReviewsMapper;
import com.ensa.achrafkarim.backend.repository.ReviewsRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class ReviewsServiceImpl implements ReviewsService{

    ReviewsRepository  reviewsRepository;
    ReviewsMapper reviewsMapper;

    @Override
    public List<ReviewsDto> getReviewsByProduct(Long productId) {
        List<Reviews> reviewsList = reviewsRepository.findAllByproductId(productId);
        return reviewsList.stream()
                .map(rev -> reviewsMapper.toDto(rev))
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewsDto> getReviewsByUserId(Long userId) {
        List<Reviews> reviewsList = reviewsRepository.findAllByusersId(userId);
        return reviewsList.stream()
                .map(rev -> reviewsMapper.toDto(rev))
                .collect(Collectors.toList());
    }

    @Override
    public ReviewsDto createReview(ReviewsDto reviewsDto, Long productId, Long userId) {
        return null;
    }

    @Override
    public ReviewsDto updateReview(Long reviewId, ReviewsDto reviewsDto) {
        return null;
    }

    @Override
    public void deleteReview(Long reviewId) {

    }

    @Override
    public List<ReviewsDto> getReviewsByRating(double rating) {
        return List.of();
    }

    @Override
    public List<ReviewsDto> getReviewsByRatingRange(double minRating, double maxRating) {
        return List.of();
    }

    @Override
    public List<ReviewsDto> getReviewsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return List.of();
    }

    @Override
    public double getAverageRatingByProduct(Long productId) {
        return 0;
    }

    @Override
    public long getReviewCountByProduct(Long productId) {
        return 0;
    }

    @Override
    public long getReviewCountByUser(Long userId) {
        return 0;
    }
}
