package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RFMInputDto {

    private Long customerId;
    private LocalDate lastPurchaseDate;
    private int purchaseCount;
    private double totalAmount;
}
