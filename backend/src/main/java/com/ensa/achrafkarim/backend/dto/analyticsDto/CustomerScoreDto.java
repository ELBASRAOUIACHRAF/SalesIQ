package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerScoreDto {
    private Double score;
    private String grade;
    private Long totalCustomers;
    private Long newCustomers;
    private Double retentionRate;
    private Double churnRate;
    private Double customerSatisfaction;
    private Double avgCustomerLifetimeValue;
}