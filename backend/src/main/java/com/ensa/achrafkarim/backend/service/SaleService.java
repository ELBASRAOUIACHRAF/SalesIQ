package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.enums.Status;

import java.util.List;

public interface SaleService {

    SaleDto updateSaleStatus(Long saleId, Status newStatus);
    SaleDto getSale(Long id);
    List<SaleDto> listSales();
    List<SaleDto> getSalesByUser(Long userId);

}
