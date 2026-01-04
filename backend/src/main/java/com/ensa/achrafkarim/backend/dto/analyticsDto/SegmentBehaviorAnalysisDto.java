package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SegmentBehaviorAnalysisDto {
    private String segmentName;
    private Long totalUsers;
    private Long totalPurchases;
    private Double totalRevenue;
    private Double avgOrderValue;
    private Double avgPurchasesPerUser;
    private Long totalProductsBought;
}