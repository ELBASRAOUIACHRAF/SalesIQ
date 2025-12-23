package com.ensa.achrafkarim.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryDetailsDto {
    private Long id;
    private String name;
    private String description;
    private boolean isActive;
    private Long productCount;
}
