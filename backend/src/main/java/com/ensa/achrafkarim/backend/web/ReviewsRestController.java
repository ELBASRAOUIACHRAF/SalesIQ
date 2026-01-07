package com.ensa.achrafkarim.backend.web;

import com.ensa.achrafkarim.backend.dto.ReviewsDetailsDto;
import com.ensa.achrafkarim.backend.dto.ReviewsDto;
import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.entities.Reviews;
import com.ensa.achrafkarim.backend.service.ReviewsService;
import com.ensa.achrafkarim.backend.service.UsersService;
import jakarta.websocket.server.PathParam;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/reviews")
//@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@AllArgsConstructor
public class ReviewsRestController {

    ReviewsService reviewsService;
    private final UsersService usersService;

    @PreAuthorize("permitAll()")
    @GetMapping("/productreviews/{productId}")
    public List<ReviewsDto> getReviewsByProduct(@PathVariable Long productId){
        return reviewsService.getReviewsByProduct(productId);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/productreviewsdetails/{productId}")
    public List<ReviewsDetailsDto> getReviewsByProductDetails(@PathVariable Long productId){
        return reviewsService.getReviewsByProductWithUsers(productId);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/productreviewscount/{productId}")
    public Long getReviewsCountByProduct(@PathVariable Long productId){
        return reviewsService.getReviewCountByProduct(productId);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/averagerating/{productId}")
    public double getAverageRatingByProduct(@PathVariable Long productId){
        return reviewsService.getAverageRatingByProduct(productId);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/reviewsbyrate/{rating}")
    public List<ReviewsDto> getReviewsByRating(@PathVariable double rating){
        return reviewsService.getReviewsByRating(rating);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/ratingrange")
    public List<ReviewsDto> getRatingRangeReviews(@RequestParam double minRate, @RequestParam double maxRate){
        return reviewsService.getReviewsByRatingRange(minRate, maxRate);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/daterange")
    public Page<@NonNull ReviewsDto> getDateRangeReviews(@RequestParam LocalDateTime minDate, @RequestParam LocalDateTime maxDate, @RequestParam int page, @RequestParam int size){
        return reviewsService.getReviewsByDateRange(minDate, maxDate, page, size);
    }

    @GetMapping("/userreviews/{userId}")
    public List<ReviewsDto> getReviewsByUser(@PathVariable Long userId){
        return reviewsService.getReviewsByUserId(userId);
    }

    @GetMapping("/myreviews")
    public ResponseEntity<List<ReviewsDto>> getMyReviews(Principal principal){
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        UsersDto user = usersService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(reviewsService.getReviewsByUserId(user.getId()));
    }

    @GetMapping("/userreviewscount/{userId}")
    public Long getReviewsCountByUser(@PathVariable Long userId){
        return reviewsService.getReviewCountByUser(userId);
    }

    @DeleteMapping("/deletereview/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId, Principal principal){
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        UsersDto user = usersService.getUserByEmail(principal.getName());
        reviewsService.deleteReview(reviewId, user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/createreview")
    public ResponseEntity<ReviewsDto> createReview(Principal principal, @RequestBody ReviewsDto reviewsDto, @RequestParam Long productId) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        UsersDto user = usersService.getUserByEmail(principal.getName());

        return ResponseEntity.ok(reviewsService.createReview(reviewsDto, productId, user.getId()));
    }

    @PutMapping("/updatereview/{reviewId}")
    public  ResponseEntity<ReviewsDto> updateReview(@RequestBody ReviewsDto reviewsDto, @PathVariable Long reviewId, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        UsersDto user = usersService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(reviewsService.updateReview(reviewId, reviewsDto, user.getId()));
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/reviewsByProduct")
    public Page<@NonNull ReviewsDto> getReviewsByProduct(@RequestParam Long productId, @RequestParam int page, @RequestParam int size) {
        return reviewsService.getReviewsByProduct(productId, page, size);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/recentReviewsByProduct")
    public Page<@NonNull ReviewsDto> recentReviewsByProduct(@RequestParam Long productId, @RequestParam int page, @RequestParam int size) {
        return reviewsService.getRecentReviewsByProduct(productId, page, size);
    }

    @PreAuthorize("permitAll()")
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
