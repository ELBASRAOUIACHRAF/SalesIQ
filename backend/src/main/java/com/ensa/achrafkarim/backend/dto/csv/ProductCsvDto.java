package com.ensa.achrafkarim.backend.dto.csv;

import com.opencsv.bean.CsvBindByName;
import lombok.Data;

@Data
public class ProductCsvDto {

    @CsvBindByName(column = "id")
    private Long id;

    @CsvBindByName(column = "name", required = true)
    private String name;

    @CsvBindByName(column = "price", required = true)
    private Double price;

    @CsvBindByName(column = "asin")
    private String asin;

    @CsvBindByName(column = "description")
    private String description;

    @CsvBindByName(column = "mark")
    private String mark;

    @CsvBindByName(column = "discount")
    private Double discount;

    @CsvBindByName(column = "stock")
    private Long stock;

    @CsvBindByName(column = "image_url")
    private String imageUrl;

    @CsvBindByName(column = "weight")
    private Double weight;

    @CsvBindByName(column = "length")
    private Double length;

    @CsvBindByName(column = "height")
    private Double height;

    @CsvBindByName(column = "is_active")
    private Boolean isActive;

    @CsvBindByName(column = "category_name")
    private String categoryName;
}