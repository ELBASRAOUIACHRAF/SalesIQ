package com.ensa.achrafkarim.backend.entities;

import com.ensa.achrafkarim.backend.enums.Role;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class Users {
    @Id
    @GeneratedValue
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phoneNumber;
    private Role role;
    private double hoursLoggedIn;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;

    @OneToMany(mappedBy = "users")
    private List<Sale> sales;

    @OneToMany(mappedBy = "users")
    private List<Reviews>  reviews;
}
