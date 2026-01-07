package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerMetricsDto {
    private Long totalCustomers;
    private Long newCustomers;
    private Long returningCustomers;
    private Double retentionRate;
    private Double churnRate;
    private Double avgCustomerValue;
}