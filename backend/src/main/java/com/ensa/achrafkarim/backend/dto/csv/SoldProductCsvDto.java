package com.ensa.achrafkarim.backend.dto.csv;

import com.opencsv.bean.CsvBindByName;
import lombok.Data;

@Data
public class SoldProductCsvDto {

    @CsvBindByName(column = "id")
    private Long id;

    @CsvBindByName(column = "quantity")
    private Integer quantity;

    @CsvBindByName(column = "unit_price")
    private Double unitPrice;

    @CsvBindByName(column = "product_name")
    private String productName;

    @CsvBindByName(column = "sale_id")
    private Long saleId;
}