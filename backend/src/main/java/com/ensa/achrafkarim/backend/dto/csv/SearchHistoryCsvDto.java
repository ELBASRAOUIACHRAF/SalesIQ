package com.ensa.achrafkarim.backend.dto.csv;

import com.opencsv.bean.CsvBindByName;
import lombok.Data;

@Data
public class SearchHistoryCsvDto {

    @CsvBindByName(column = "id")
    private Long id;

    @CsvBindByName(column = "user_email")
    private String userEmail;

    @CsvBindByName(column = "query")
    private String query;

    @CsvBindByName(column = "searched_at")
    private String searchedAt;
}