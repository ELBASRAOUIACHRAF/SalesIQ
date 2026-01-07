package com.ensa.achrafkarim.backend.dto.csv;

import com.opencsv.bean.CsvBindByName;
import lombok.Data;

@Data
public class CategoryCsvDto {

    @CsvBindByName(column = "id")
    private Long id;

    @CsvBindByName(column = "name", required = true)
    private String name;

    @CsvBindByName
    private String description;

    @CsvBindByName
    private Boolean isActive;
}
