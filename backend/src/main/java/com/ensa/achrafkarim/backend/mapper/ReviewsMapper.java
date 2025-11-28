package com.ensa.achrafkarim.backend.mapper;


import com.ensa.achrafkarim.backend.dto.ReviewsDto;
import com.ensa.achrafkarim.backend.entities.Reviews;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReviewsMapper {
    ReviewsDto toDto(Reviews reviews);
    Reviews toEntity(ReviewsDto reviewsDto);
}
