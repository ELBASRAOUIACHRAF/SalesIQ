package com.ensa.achrafkarim.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ReviewsDetailsDto {
    private Long id;
    private String comment;
    private double rating;
    private LocalDateTime reviewDate;
    private String userName;

}
