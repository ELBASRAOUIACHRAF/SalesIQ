package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScoreHistoryDto {
    private LocalDate date;
    private Double financialScore;
    private Double customerScore;
    private Double operationsScore;
    private Double productScore;
    private Double overallScore;
}