package com.ensa.achrafkarim.backend.web;

import com.ensa.achrafkarim.backend.dto.ReviewsDetailsDto;
import com.ensa.achrafkarim.backend.dto.ReviewsDto;
import com.ensa.achrafkarim.backend.entities.Reviews;
import com.ensa.achrafkarim.backend.service.ReviewsService;
import jakarta.websocket.server.PathParam;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/reviews")
@AllArgsConstructor
public class ReviewsRestController {

    ReviewsService reviewsService;

    @GetMapping("/productreviews/{productId}")
    public List<ReviewsDto> getReviewsByProduct(@PathVariable Long productId){
        return reviewsService.getReviewsByProduct(productId);
    }

    @GetMapping("/productreviewsdetails/{productId}")
    public List<ReviewsDetailsDto> getReviewsByProductDetails(@PathVariable Long productId){
        return reviewsService.getReviewsByProductWithUsers(productId);
    }

    @GetMapping("/productreviewscount/{productId}")
    public Long getReviewsCountByProduct(@PathVariable Long productId){
        return reviewsService.getReviewCountByProduct(productId);
    }

    @GetMapping("/averagerating/{productId}")
    public double getAverageRatingByProduct(@PathVariable Long productId){
        return reviewsService.getAverageRatingByProduct(productId);
    }

    @GetMapping("/reviewsbyrate/{rating}")
    public List<ReviewsDto> getReviewsByRating(@PathVariable double rating){
        return reviewsService.getReviewsByRating(rating);
    }

    @GetMapping("/ratingrange")
    public List<ReviewsDto> getRatingRangeReviews(@RequestParam double minRate, @RequestParam double maxRate){
        return reviewsService.getReviewsByRatingRange(minRate, maxRate);
    }

    @GetMapping("/daterange")
    public Page<@NonNull ReviewsDto> getDateRangeReviews(@RequestParam LocalDateTime minDate, @RequestParam LocalDateTime maxDate, @RequestParam int page, @RequestParam int size){
        return reviewsService.getReviewsByDateRange(minDate, maxDate, page, size);
    }

    @GetMapping("/userreviews/{userId}")
    public List<ReviewsDto> getReviewsByUser(@PathVariable Long userId){
        return reviewsService.getReviewsByUserId(userId);
    }

    @GetMapping("/userreviewscount/{userId}")
    public Long getReviewsCountByUser(@PathVariable Long userId){
        return reviewsService.getReviewCountByUser(userId);
    }

    @DeleteMapping("/deletereview/{reviewId}")
    public void deleteReview(@PathVariable Long reviewId){
        reviewsService.deleteReview(reviewId);
    }

    @PostMapping("/createreview")
    public ReviewsDto createReview(@RequestBody ReviewsDto reviewsDto, @RequestParam Long productId, @RequestParam Long userId) {
        return reviewsService.createReview(reviewsDto, productId, userId);
    }

    @PutMapping("/updatereview/{reviewId}")
    public  ReviewsDto updateReview(@RequestBody ReviewsDto reviewsDto, @PathVariable Long reviewId) {
        return reviewsService.updateReview(reviewId, reviewsDto);
    }

    @GetMapping("/reviewsByProduct")
    public Page<@NonNull ReviewsDto> getReviewsByProduct(@RequestParam Long productId, @RequestParam int page, @RequestParam int size) {
        return reviewsService.getReviewsByProduct(productId, page, size);
    }

    @GetMapping("/recentReviewsByProduct")
    public Page<@NonNull ReviewsDto> recentReviewsByProduct(@RequestParam Long productId, @RequestParam int page, @RequestParam int size) {
        return reviewsService.getRecentReviewsByProduct(productId, page, size);
    }

    @GetMapping("/ratingDistributionByProduct")
    public Page<Object[]> ratingDistributionByProduct(@RequestParam Long productId, @RequestParam int page, @RequestParam int size) {
        return reviewsService.getRatingDistributionByProduct(productId, page, size);
    }

    @GetMapping("/hasUserLeftAReview")
    public boolean hasUserLeftAReview(@RequestParam Long userId, @RequestParam Long productId) {
        return reviewsService.hasUserReviewedProduct(userId, productId);
    }

    @GetMapping("/doesReviewExists")
    public boolean doesReviewExists(@RequestParam Long reviewId) {
        return reviewsService.reviewExists(reviewId);
    }
}
