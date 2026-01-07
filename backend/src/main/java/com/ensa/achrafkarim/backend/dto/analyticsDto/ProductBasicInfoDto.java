package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductBasicInfoDto {
    private Long productId;
    private String name;
    private String description;
    private String mark;
    private Double price;
    private Double discount;
    private String categoryName;
    private String imageUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Integer daysOnMarket;
}