package com.ensa.achrafkarim.backend.dto.csv;

import com.opencsv.bean.CsvBindByName;
import lombok.Data;

@Data
public class BasketCsvDto {

    @CsvBindByName(column = "id")
    private Long id;

    @CsvBindByName(column = "user_email")
    private String userEmail;

    @CsvBindByName(column = "created_at")
    private String createdAt;

    @CsvBindByName(column = "updated_at")
    private String updatedAt;
}