package com.ensa.achrafkarim.backend.mapper;

import com.ensa.achrafkarim.backend.dto.ReviewsDetailsDto;
import com.ensa.achrafkarim.backend.entities.Reviews;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewsDetailsMapper {

    @Mapping(source = "users.username", target = "userName")
    ReviewsDetailsDto toDto(Reviews reviews);

    Reviews toEntity(ReviewsDetailsDto reviewsDto);
}