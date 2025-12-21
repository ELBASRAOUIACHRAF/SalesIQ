package com.ensa.achrafkarim.backend.web;

import com.ensa.achrafkarim.backend.dto.CategoryDto;
import com.ensa.achrafkarim.backend.dto.ProductOrderInfoDto;
import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.enums.PaymentMethod;
import com.ensa.achrafkarim.backend.enums.Status;
import com.ensa.achrafkarim.backend.service.SaleService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("sales")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@AllArgsConstructor
public class SaleRestController {

    private SaleService saleService;

    @GetMapping("/gatsale/{saleId}")
    public SaleDto getSaleById(@PathVariable Long saleId){
        return saleService.getSale(saleId);
    }

    @GetMapping("/getsales")
    public List<SaleDto> getSales() {
        return saleService.listSales();
    }

    @GetMapping("/usersale/{userId}")
    public List<SaleDto> getSaleByUser(@PathVariable Long userId) {
        return saleService.getSalesByUser(userId);
    }

    @PostMapping("/addsale/{userId}")
    public SaleDto addSale(@RequestBody SaleDto saleDto,@PathVariable Long userId) {
        return saleService.createSale(saleDto, userId);
    }

    @DeleteMapping("/deletesale/{saleId}")
    public void deleteSale(@PathVariable Long saleId) {
        saleService.deleteSale(saleId);
    }

    @GetMapping("/salesPage")
    public Page<SaleDto> getSalesPage(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "10") int size) {
        return saleService.getSalesPage(page,  size);
    }

    @GetMapping("/statussales/{status}")
    public List<SaleDto> getSaleByStatus(@PathVariable Status status) {
        return saleService.getSaleByStatus(status);
    }

    @GetMapping("/pymethodsales/{paymentMethod}")
    public List<SaleDto> getSaleByPaymentMethod(@PathVariable PaymentMethod paymentMethod) {
        return saleService.getSalesByPaymentMethod(paymentMethod);
    }

    @PutMapping("/updatestatus")
    public SaleDto updateStatus(@RequestParam Long saleId,  @RequestParam Status status) {
        return saleService.updateSaleStatus(saleId, status);
    }

    @PutMapping("/updatesale/{saleId}")
    public SaleDto updateSale(@PathVariable Long saleId,  @RequestBody SaleDto saleDto) {
        return saleService.updateSale(saleId, saleDto);
    }

    @GetMapping("/salesbydate")
    public List<SaleDto> saleByDateRange(@RequestParam LocalDateTime startDate, @RequestParam LocalDateTime endDate) {
        return saleService.getSalesByDateRange(startDate, endDate);
    }

}
