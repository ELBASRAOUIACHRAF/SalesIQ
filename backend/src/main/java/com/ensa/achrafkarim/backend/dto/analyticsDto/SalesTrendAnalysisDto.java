package com.ensa.achrafkarim.backend.dto.analyticsDto;

import com.ensa.achrafkarim.backend.enums.analyticsEnum.TimeGranularity;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SalesTrendAnalysisDto {
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // aggregate sales that we got by time stamps
    private TimeGranularity timeGranularity;

    private List<>

    private Double revenue;
    private long salesCount;
    private long quantitySold;
    private Double averageSaleValue;
}
