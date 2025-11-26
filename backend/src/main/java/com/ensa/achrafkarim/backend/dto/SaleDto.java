package com.ensa.achrafkarim.backend.dto;

import com.ensa.achrafkarim.backend.enums.PaymentMethod;
import com.ensa.achrafkarim.backend.enums.Status;

import java.time.LocalDateTime;

public class SaleDto {

    private Long id;
    private LocalDateTime dateOfSale;
    private PaymentMethod paymentMethod;
    private Status status;

}
