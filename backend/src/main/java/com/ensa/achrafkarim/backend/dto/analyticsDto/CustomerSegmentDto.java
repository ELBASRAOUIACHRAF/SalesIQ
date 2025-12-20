package com.ensa.achrafkarim.backend.dto.analyticsDto;

import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.enums.Segment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSegmentDto {
    private Segment segmentName;
    private Long customerCount;
    private List<Long> customerIds;
}