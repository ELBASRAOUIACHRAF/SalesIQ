package com.ensa.achrafkarim.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CategoryDto {
    private Long id;
    private String name;
    private String description;
}
