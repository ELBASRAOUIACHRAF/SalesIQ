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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private double price;
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
    private Boolean isActive = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "product")
    private List<SoldProduct> soldProducts;

    @OneToMany(mappedBy = "product")
    private List<BasketItem> basketItems;

    @ManyToOne
    private Category category;

    @OneToMany (mappedBy = "product")
    private List<Reviews> reviewsList;
}
