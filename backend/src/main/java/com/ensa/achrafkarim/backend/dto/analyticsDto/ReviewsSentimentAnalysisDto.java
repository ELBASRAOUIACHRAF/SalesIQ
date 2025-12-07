package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewsSentimentAnalysisDto {
    private Long productId;
    private Integer totalReviews;
    private Integer positiveCount;
    private Integer neutralCount;
    private Integer negativeCount;
    private String overallSentiment; // POSITIVE, NEUTRAL, NEGATIVE
}