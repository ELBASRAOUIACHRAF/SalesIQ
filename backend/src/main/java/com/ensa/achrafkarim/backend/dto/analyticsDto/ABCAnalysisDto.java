package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ABCAnalysisDto {

    private List<ABCProductDto> classA;
    private List<ABCProductDto> classB;
    private List<ABCProductDto> classC;

    private double totalRevenue;
}

