package com.ensa.achrafkarim.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
@Data
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private double price;
    private double rating;
    private Long reviewsCount;
    private String asin;
    private String description;
    private String mark;
    private double discount;
    private String imageUrl;
    private List<String> imagesGallery;
    private double weight;
    private double length;
    private double height;

}
