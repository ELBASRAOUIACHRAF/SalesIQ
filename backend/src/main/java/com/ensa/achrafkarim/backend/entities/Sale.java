package com.ensa.achrafkarim.backend.entities;

import com.ensa.achrafkarim.backend.enums.PaymentMethod;
import com.ensa.achrafkarim.backend.enums.Status;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Sale {
    @Id
    @GeneratedValue
    private Long id;
    private LocalDateTime dateOfSale;
    private PaymentMethod paymentMethod;
    private Status status;
}
