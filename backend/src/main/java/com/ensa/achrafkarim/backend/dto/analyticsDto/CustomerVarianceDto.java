package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerVarianceDto {
    private Long targetNewCustomers;
    private Long actualNewCustomers;
    private Long newCustomerVariance;
    private Double newCustomerVariancePercent;
    private Double targetRetentionRate;
    private Double actualRetentionRate;
    private Double retentionVariance;
    private Double targetChurnRate;
    private Double actualChurnRate;
    private Double churnVariance;
}