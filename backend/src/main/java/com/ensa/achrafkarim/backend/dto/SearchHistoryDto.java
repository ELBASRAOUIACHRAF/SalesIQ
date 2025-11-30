package com.ensa.achrafkarim.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SearchHistoryDto {
    private Long id;
    private String query;
}
