package com.ensa.achrafkarim.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductOrderInfoDto {
    private Long productId;
    private int quantity;
    private Double unitPrice;
}