package com.ensa.achrafkarim.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class Product {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private double price;
    private double rating;
    private Long reviewsCount;
    private String asin;
    private String description;
    private String mark;
    private double discount;
    private Long stock;
    private String imageUrl;
    @ElementCollection
    private List<String> imagesGallery;
    private double weight;
    private double length;
    private double height;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToOne
    private SoldProduct soldProduct;

    @ManyToOne
    private Category category;
}
