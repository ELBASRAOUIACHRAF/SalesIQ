package com.ensa.achrafkarim.backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Reviews {
    @Id
    @GeneratedValue
    private Long id;
    private String comment;
    private double rating;
    @Column(nullable = true)
    private LocalDateTime  reviewDate;
}
