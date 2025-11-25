package com.ensa.achrafkarim.backend.entities;

import com.ensa.achrafkarim.backend.enums.PaymentMethod;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class Category {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private String description;
    private boolean isActive = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "category")
    private List<Product> products;
}
