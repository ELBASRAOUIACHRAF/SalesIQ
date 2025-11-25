package com.ensa.achrafkarim.backend.entities;

import jakarta.persistence.*;
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
