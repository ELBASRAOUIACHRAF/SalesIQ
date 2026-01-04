package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChurnAnalysisDto {
    private Long usersAtStart;
    private Long usersLost;
    private Double churnRate;
    private Long activeUsers;
    private Long totalUsersAtEnd;
}