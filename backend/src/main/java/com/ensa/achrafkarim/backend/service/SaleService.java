package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.Status;

import java.util.List;

public interface SaleService {

    SaleDto updateSaleStatus(Long saleId, Status newStatus);
    SaleDto getSale(Long id);
    List<SaleDto> listSales();
    List<SaleDto> getSalesByUser(Long userId);
    SaleDto createSale(SaleDto saleDto, Users users);
    SaleDto updateSale(Long id, SaleDto saleDto);
    void deleteSale(Long id);
    List<SaleDto> getSaleByStatus(Status status);

}
