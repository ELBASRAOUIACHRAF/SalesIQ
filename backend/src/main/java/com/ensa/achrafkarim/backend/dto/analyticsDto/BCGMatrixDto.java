package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BCGMatrixDto {
    private List<BCGProductDto> stars;
    private List<BCGProductDto> cashCows;
    private List<BCGProductDto> questionMarks;
    private List<BCGProductDto> dogs;
    private Integer starsCount;
    private Integer cashCowsCount;
    private Integer questionMarksCount;
    private Integer dogsCount;
}