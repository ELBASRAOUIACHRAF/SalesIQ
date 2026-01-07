package com.ensa.achrafkarim.backend.service.csv;

import com.ensa.achrafkarim.backend.dto.csv.ReviewsCsvDto;
import com.ensa.achrafkarim.backend.entities.Product;
import com.ensa.achrafkarim.backend.entities.Reviews;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.repository.ProductRepository;
import com.ensa.achrafkarim.backend.repository.ReviewsRepository;
import com.ensa.achrafkarim.backend.repository.UsersRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ReviewsCsvParser extends AbstractCsvParser<ReviewsCsvDto, Reviews> {

    private final ReviewsRepository reviewsRepository;
    private final UsersRepository usersRepository;
    private final ProductRepository productRepository;

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    protected Class<ReviewsCsvDto> getDtoClass() {
        return ReviewsCsvDto.class;
    }

    @Override
    protected List<ReviewsCsvDto> getAllDtos() {
        return reviewsRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Reviews toEntity(ReviewsCsvDto dto) {
        Reviews review = new Reviews();

        if (dto.getId() != null) {
            review.setId(dto.getId());
        }

        review.setComment(dto.getComment());
        review.setRating(dto.getRating() != null ? dto.getRating() : 0.0);

        if (dto.getReviewDate() != null && !dto.getReviewDate().isEmpty()) {
            review.setReviewDate(LocalDateTime.parse(dto.getReviewDate(), DATE_FORMAT));
        } else {
            review.setReviewDate(LocalDateTime.now());
        }

        if (dto.getUserEmail() != null && !dto.getUserEmail().isEmpty()) {
            Users user = usersRepository.findByEmail(dto.getUserEmail());
            if (user == null) throw new RuntimeException("User not found: " + dto.getUserEmail());
            review.setUsers(user);
        }

        if (dto.getProductName() != null && !dto.getProductName().isEmpty()) {
            Product product = productRepository.findByName(dto.getProductName());
            if (product == null) throw new RuntimeException("Product not found: " + dto.getProductName());
            review.setProduct(product);
        }

        return review;
    }

    @Override
    public ReviewsCsvDto toDto(Reviews entity) {
        ReviewsCsvDto dto = new ReviewsCsvDto();

        dto.setId(entity.getId());
        dto.setComment(entity.getComment());
        dto.setRating(entity.getRating());

        if (entity.getReviewDate() != null) {
            dto.setReviewDate(entity.getReviewDate().format(DATE_FORMAT));
        }

        if (entity.getUsers() != null) {
            dto.setUserEmail(entity.getUsers().getEmail());
        }

        if (entity.getProduct() != null) {
            dto.setProductName(entity.getProduct().getName());
        }

        return dto;
    }

    @Override
    @Transactional
    public int importCsv(MultipartFile file) throws Exception {
        List<ReviewsCsvDto> dtos = parseCsv(file);

        List<Reviews> reviews = dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());

        reviewsRepository.saveAll(reviews);
        return reviews.size();
    }
}