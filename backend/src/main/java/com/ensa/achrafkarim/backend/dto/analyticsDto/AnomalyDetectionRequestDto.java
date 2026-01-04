package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnomalyDetectionRequestDto {
    private List<DailySalesDto> salesData;
    private Double sensitivityThreshold;
}