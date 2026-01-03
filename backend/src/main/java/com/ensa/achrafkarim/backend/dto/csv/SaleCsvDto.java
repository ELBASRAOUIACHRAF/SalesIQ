package com.ensa.achrafkarim.backend.dto.csv;

import com.opencsv.bean.CsvBindByName;
import com.opencsv.bean.CsvDate;
import lombok.Data;

@Data
public class SaleCsvDto {

    @CsvBindByName(column = "id")
    private Long id;

    @CsvBindByName(column = "date_of_sale")
    @CsvDate("yyyy-MM-dd HH:mm:ss")
    private String dateOfSale;

    @CsvBindByName(column = "payment_method")
    private String paymentMethod;

    @CsvBindByName(column = "status")
    private String status;

    @CsvBindByName(column = "user_email")
    private String userEmail;
}