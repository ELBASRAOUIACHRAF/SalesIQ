package com.ensa.achrafkarim.backend.dto;

import com.ensa.achrafkarim.backend.entities.Product;
import com.ensa.achrafkarim.backend.entities.Sale;

public class SoldProductDto {

    private Long id;
    private int quantity;
    private double unitPrice;
    private Product product;
    private Sale sale;
}
