package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopicExtractionRequestDto {
    private Long productId;
    private String productName;
    private List<ReviewTextDto> reviews;
    private Integer numTopics;
}