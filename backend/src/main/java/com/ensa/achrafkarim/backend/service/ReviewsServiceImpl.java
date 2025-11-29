package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ReviewsDto;
import com.ensa.achrafkarim.backend.entities.Reviews;
import com.ensa.achrafkarim.backend.mapper.ReviewsMapper;
import com.ensa.achrafkarim.backend.repository.ProductRepository;
import com.ensa.achrafkarim.backend.repository.ReviewsRepository;
import com.ensa.achrafkarim.backend.repository.UsersRepository;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    ProductRepository productRepository;
    UsersRepository usersRepository;

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
        Reviews reviews = reviewsMapper.toEntity(reviewsDto);
        reviews.setUsers(usersRepository.findById(userId).get());         //Use service instead of repository
        reviews.setProduct(productRepository.findById(productId).get());  //Use service instead of repository
        Reviews savedReview = reviewsRepository.save(reviews);
        return reviewsMapper.toDto(savedReview);
    }

    @Override
    public ReviewsDto updateReview(Long reviewId, ReviewsDto reviewsDto) {
        Reviews reviews = reviewsRepository.findById(reviewId).get();
        reviews.setComment(reviewsDto.getComment());
        reviews.setRating(reviewsDto.getRating());
        Reviews savedReview = reviewsRepository.save(reviews);
        return reviewsMapper.toDto(savedReview);
    }

    @Override
    public void deleteReview(Long reviewId) {
        if (!reviewsRepository.existsById(reviewId)) return ;
        reviewsRepository.deleteById(reviewId);
    }

    @Override
    public List<ReviewsDto> getReviewsByRating(double rating) {
        List<Reviews> reviewsList = reviewsRepository.findByRating(rating);
        return reviewsList.stream()
                .map(rev -> reviewsMapper.toDto(rev))
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewsDto> getReviewsByRatingRange(double minRating, double maxRating) {
        List<Reviews> reviewsList = reviewsRepository.findByRatingBetween(minRating,maxRating);
        return reviewsList.stream()
                .map(rev -> reviewsMapper.toDto(rev))
                .collect(Collectors.toList());
    }

    @Override
    public Page<@NonNull ReviewsDto> getReviewsByDateRange(LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<@NonNull Reviews> reviewsPage = reviewsRepository.findByReviewDateBetween(startDate, endDate, pageable);
        return reviewsPage.map(rev -> reviewsMapper.toDto(rev));
    }

    @Override
    public double getAverageRatingByProduct(Long productId) {
        double averageRating = reviewsRepository.findAverageRatingByProductId(productId);
        return averageRating;
    }

    @Override
    public long getReviewCountByProduct(Long productId) {
        List<Reviews> reviewsList = reviewsRepository.findAllByproductId(productId);
        return reviewsList.size();
    }

    @Override
    public long getReviewCountByUser(Long userId) {
        List<Reviews> reviewsList = reviewsRepository.findAllByusersId(userId);
        return reviewsList.size();
    }

    @Override
    public List<Object[]> getRatingDistributionByProduct(Long productId) {
        return (reviewsRepository.getRatingDistributionByProduct(productId));
    }

    @Override
    public Page<@NonNull ReviewsDto> getReviewsByProduct(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewsRepository.getReviewsByProduct(productId, pageable).map(rev -> reviewsMapper.toDto(rev));
    }

    @Override
    public Page<@NonNull ReviewsDto> getRecentReviewsByProduct(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewsRepository.getRecentReviewsByProduct(productId, pageable).map(rev -> reviewsMapper.toDto(rev));
    }

    @Override
    public boolean hasUserReviewedProduct(Long userId, Long productId) {
        return reviewsRepository.existsByUsersIdAndProductId(userId, productId);
    }

    @Override
    public boolean reviewExists(Long reviewId) {
        return reviewsRepository.existsById(reviewId);
    }

    @Override
    public void approveReview(Long reviewId) {

    }

    @Override
    public void rejectReview(Long reviewId) {

    }

    @Override
    public List<ReviewsDto> getPendingReviews() {
        return List.of();
    }

    @Override
    public List<ReviewsDto> getReviewsWithImages(Long productId) {
        return List.of();
    }

    @Override
    public void softDeleteReview(Long reviewId) {

    }

    @Override
    public void restoreDeletedReview(Long reviewId) {

    }

    @Override
    public ReviewsDto replyToReview(Long reviewId, String replyMessage, Long adminId) {
        return null;
    }

    @Override
    public ReviewsDto updateReviewReply(Long reviewId, String replyMessage) {
        return null;
    }

    @Override
    public void deleteReviewReply(Long reviewId) {

    }

    @Override
    public void setFeaturedReview(Long productId, Long reviewId) {

    }

    @Override
    public ReviewsDto getFeaturedReview(Long productId) {
        return null;
    }
}
