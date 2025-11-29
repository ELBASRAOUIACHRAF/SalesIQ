package com.ensa.achrafkarim.backend.dto;

import com.ensa.achrafkarim.backend.enums.PaymentMethod;
import com.ensa.achrafkarim.backend.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class SaleDto {

    private Long id;
    private LocalDateTime dateOfSale;
    private PaymentMethod paymentMethod;
    private Status status;
    private List<ProductOrderInfoDto> productOrderInfoList;

}
