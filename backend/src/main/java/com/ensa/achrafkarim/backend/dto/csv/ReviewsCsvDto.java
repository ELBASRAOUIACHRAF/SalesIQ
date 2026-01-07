package com.ensa.achrafkarim.backend.dto.csv;

import com.opencsv.bean.CsvBindByName;
import lombok.Data;

@Data
public class ReviewsCsvDto {

    @CsvBindByName(column = "id")
    private Long id;

    @CsvBindByName(column = "comment")
    private String comment;

    @CsvBindByName(column = "rating")
    private Double rating;

    @CsvBindByName(column = "review_date")
    private String reviewDate;

    @CsvBindByName(column = "user_email")
    private String userEmail;

    @CsvBindByName(column = "product_name")
    private String productName;
}