package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopCustomerDto {
    private Long userId;
    private String username;
    private String email;
    private Double totalSpent;
    private Long totalOrders;
    private Integer rank;
}