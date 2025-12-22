package com.ensa.achrafkarim.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SearchHistoryDto {
    private Long id;
    private String query;
    private LocalDateTime searchedAt;
}
