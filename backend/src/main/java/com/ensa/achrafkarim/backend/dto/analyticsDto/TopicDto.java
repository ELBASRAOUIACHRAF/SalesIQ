package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopicDto {
    private Integer topicId;
    private String topicName;
    private List<String> keywords;
    private Double weight;
    private Integer reviewCount;
    private Double avgSentiment;
    private String sentimentLabel;
}