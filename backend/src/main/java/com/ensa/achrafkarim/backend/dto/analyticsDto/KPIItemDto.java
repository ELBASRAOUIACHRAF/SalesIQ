package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KPIItemDto {
    private String name;
    private String category;
    private Double value;
    private Double target;
    private Double achievement;
    private String status;
    private String trend;
}