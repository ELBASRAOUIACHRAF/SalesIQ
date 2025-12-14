package com.ensa.achrafkarim.backend.dto.analyticsDto;

import com.ensa.achrafkarim.backend.enums.analyticsEnum.TimeGranularity;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class SalesTrendAnalysisDto {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private TimeGranularity timeGranularity;

    List<SalesTrendPointDto> points;
}
