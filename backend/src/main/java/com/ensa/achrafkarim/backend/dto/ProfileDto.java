package com.ensa.achrafkarim.backend.dto;

import com.ensa.achrafkarim.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDto {
    // Informations de l'en-tête (Header)
    private Long id;
    private String firstName;
    private String lastName;

    private Role role;

    // Section : Personal Information
    private String username;
    private String email;
    private String phoneNumber;
    private String bio;

    // Section : Account Activity
    private double hoursLoggedIn;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Section : Address
    private String country;
    private String city;
    private String postalCode;
}
