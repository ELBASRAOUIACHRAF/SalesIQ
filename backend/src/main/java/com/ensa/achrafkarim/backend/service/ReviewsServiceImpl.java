package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ReviewsDetailsDto;
import com.ensa.achrafkarim.backend.dto.ReviewsDto;
import com.ensa.achrafkarim.backend.entities.Reviews;
import com.ensa.achrafkarim.backend.mapper.ReviewsDetailsMapper;
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
    ReviewsDetailsMapper reviewsDetailsMapper;

    @Override
    public List<ReviewsDto> getReviewsByProduct(Long productId) {
        List<Reviews> reviewsList = reviewsRepository.findAllByproductId(productId);
        return reviewsList.stream()
                .map(rev -> reviewsMapper.toDto(rev))
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewsDetailsDto> getReviewsByProductWithUsers(Long productId) {
        List<Reviews> reviewsList = reviewsRepository.findAllByproductIdWithUser(productId);
        return reviewsList.stream()
                .map(rev -> reviewsDetailsMapper.toDto(rev))
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
        return reviewsRepository.findAverageRatingByProductId(productId);
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
    public Page<Object[]> getRatingDistributionByProduct(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return (reviewsRepository.getRatingDistributionByProduct(productId, pageable));
    }

    @Override
    public double getAverageRatingByUser(Long userId) {
        List<ReviewsDto> reviewsDtoList = getReviewsByUserId(userId);
        int somme = 0;
        for (ReviewsDto reviewsDto : reviewsDtoList) {
            somme +=  reviewsDto.getRating();
        }
        return somme/reviewsDtoList.size();
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
}
