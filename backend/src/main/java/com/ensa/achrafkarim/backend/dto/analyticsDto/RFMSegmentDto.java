package com.ensa.achrafkarim.backend.dto.analyticsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RFMSegmentDto {

    private Long customerId;

    private int recency;
    private int frequency;
    private double monetary;

    private int rScore;
    private int fScore;
    private int mScore;

    private String segment;
}
