package com.ensa.achrafkarim.backend.dto.csv;

import com.opencsv.bean.CsvBindByName;
import lombok.Data;

@Data
public class UserCsvDto {

    @CsvBindByName(column = "id")
    private Long id;

    @CsvBindByName(column = "username", required = true)
    private String username;

    @CsvBindByName(column = "first_name")
    private String firstName;

    @CsvBindByName(column = "last_name")
    private String lastName;

    @CsvBindByName(column = "email", required = true)
    private String email;

    @CsvBindByName(column = "password")
    private String password;

    @CsvBindByName(column = "phone_number")
    private String phoneNumber;

    @CsvBindByName(column = "role")
    private String role;

    @CsvBindByName(column = "hours_logged_in")
    private Double hoursLoggedIn;

    @CsvBindByName(column = "active")
    private Boolean active;

    @CsvBindByName(column = "bio")
    private String bio;

    // Address fields
    @CsvBindByName(column = "country")
    private String country;

    @CsvBindByName(column = "city")
    private String city;

    @CsvBindByName(column = "postal_code")
    private String postalCode;

    @CsvBindByName(column = "segment")
    private String segment;
}