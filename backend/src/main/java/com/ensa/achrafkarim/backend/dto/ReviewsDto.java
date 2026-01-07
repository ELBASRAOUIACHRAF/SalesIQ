package com.ensa.achrafkarim.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ReviewsDto {
    private Long id;
    private String comment;
    private Double rating;
    private LocalDateTime reviewDate;

    public ReviewsDto() {}
}
