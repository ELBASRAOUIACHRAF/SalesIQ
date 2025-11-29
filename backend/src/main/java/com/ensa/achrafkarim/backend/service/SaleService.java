package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProductOrderInfoDto;
import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.enums.PaymentMethod;
import com.ensa.achrafkarim.backend.enums.Status;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleService {

    SaleDto updateSaleStatus(Long saleId, Status newStatus);
    SaleDto getSale(Long id);
    List<SaleDto> listSales();
    List<SaleDto> getSalesByUser(Long userId);
    SaleDto createSale(SaleDto saleDto, Long userId);
    SaleDto updateSale(Long saleId, SaleDto saleDto);
    void deleteSale(Long id);
    List<SaleDto> getSaleByStatus(Status status);
    List<SaleDto> getSalesByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    List<SaleDto> getSalesByPaymentMethod(PaymentMethod paymentMethod);
    byte[] exportSales(List<Long> saleIds, String format);
    
    Page<SaleDto> getSalesPage(int size, int page);
}
