package com.ensa.achrafkarim.backend.dto.analyticsDto;

import com.ensa.achrafkarim.backend.dto.UsersDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSegmentDto {
    private String segmentName;
    private Long customerCount;
    //private Double averageRevenue;
    //private Double totalRevenue;
    //private List<String> characteristics;
    private List<UsersDto> customers;
}