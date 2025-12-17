package com.ensa.achrafkarim.backend.dto;

import com.ensa.achrafkarim.backend.entities.Basket;
import com.ensa.achrafkarim.backend.entities.Product;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BasketItemDto {

    private Long id;
    private String name;
    private String imageUrl;
    private double discount;
    private Long quantity;
    private double unitPrice;
    private Long stock;
}
