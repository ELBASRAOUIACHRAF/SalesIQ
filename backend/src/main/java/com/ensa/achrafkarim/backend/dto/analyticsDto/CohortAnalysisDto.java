package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@NoArgsConstructor
public class CohortAnalysisDto {

    private int totalUsers;
    private int totalCohorts;
    private int activeUsers;
    private double avgUsersPerCohort;

}
