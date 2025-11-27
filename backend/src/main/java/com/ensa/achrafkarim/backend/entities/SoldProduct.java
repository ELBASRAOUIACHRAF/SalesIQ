package com.ensa.achrafkarim.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class SoldProduct {
    @Id
    @GeneratedValue
    private Long id;
    private int quantity;
    private double unitPrice;
    // une relation OnetoMany
    @ManyToOne
    private Product product;

    @ManyToOne
    private Sale sale;
}
