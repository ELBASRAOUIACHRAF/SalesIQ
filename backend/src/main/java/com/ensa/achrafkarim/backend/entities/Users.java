package com.ensa.achrafkarim.backend.entities;

import com.ensa.achrafkarim.backend.enums.Role;
import com.ensa.achrafkarim.backend.enums.Segment;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phoneNumber;
    @Enumerated(EnumType.STRING)
    private Role role;
    private double hoursLoggedIn;
    private boolean active = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;

    @Column(length = 500)
    private String bio;

    private String country;
    private String city;
    private String postalCode;
    // --------------------------------------------------

    @Enumerated(EnumType.STRING)
    private Segment segment;

    @OneToMany(mappedBy = "users")
    private List<Sale> sales;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Basket basket;

    @OneToMany(mappedBy = "users")
    private List<Reviews>  reviews;

    @OneToMany(mappedBy = "user")
    private List<SearchHistory>  searchHistory;

    @PrePersist
    private void initBasket() {
        if (basket == null) {
            basket = new Basket(this);
        }
    }
}
