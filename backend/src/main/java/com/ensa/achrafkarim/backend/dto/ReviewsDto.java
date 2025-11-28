package com.ensa.achrafkarim.backend.dto;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewsDto {
    private Long id;
    private String comment;
    private double rating;
    private LocalDateTime reviewDate;

}
