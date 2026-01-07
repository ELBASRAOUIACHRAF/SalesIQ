package com.ensa.achrafkarim.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
@Data
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private Double price;
    private Double rating;
    private Long reviewsCount;
    private String asin;
    private String description;
    private String mark;
    private Long stock;
    private Double discount;
    private String imageUrl;
    private List<String> imagesGallery;
    private Double weight;
    private Double length;
    private Double height;

    public ProductDto() {}
}
