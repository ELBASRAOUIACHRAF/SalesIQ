package com.ensa.achrafkarim.backend.dto;

import com.ensa.achrafkarim.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UsersDto {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Role role;
    private double hoursLoggedIn;
    private LocalDateTime lastLogin;
}
