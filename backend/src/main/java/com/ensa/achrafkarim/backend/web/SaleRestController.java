package com.ensa.achrafkarim.backend.web;

import com.ensa.achrafkarim.backend.dto.CategoryDto;
import com.ensa.achrafkarim.backend.dto.ProductOrderInfoDto;
import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.enums.PaymentMethod;
import com.ensa.achrafkarim.backend.enums.Status;
import com.ensa.achrafkarim.backend.service.SaleService;
import com.ensa.achrafkarim.backend.service.UsersService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("sales")
//@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@AllArgsConstructor
public class SaleRestController {

    private final SaleService saleService;
    private final UsersService usersService;

    @GetMapping("/getsale/{saleId}")
    public ResponseEntity<SaleDto> getSaleById(@PathVariable Long saleId, Principal principal){
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        UsersDto user = usersService.getUserByEmail(principal.getName());

        return ResponseEntity.ok(saleService.getUsersSale(saleId, user.getId()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getsales")
    public List<SaleDto> getSales() {
        return saleService.listSales();
    }

    @GetMapping("/mySales")
    public ResponseEntity<List<SaleDto>> getMySales(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        UsersDto user = usersService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(saleService.getSalesByUser(user.getId()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/usersale/{userId}")
    public List<SaleDto> getSaleByUser(@PathVariable Long userId) {
        return saleService.getSalesByUser(userId);
    }

    @PostMapping("/addsale")
    public ResponseEntity<SaleDto> addSale(@RequestBody SaleDto saleDto, Principal principal) {
        if (principal == null) {
            System.out.println("principal add sale null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();}

        UsersDto user = usersService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(saleService.createSale(saleDto, user.getId()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/deletesale/{saleId}")
    public void deleteSale(@PathVariable Long saleId) {
        saleService.deleteSale(saleId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/salesPage")
    public Page<SaleDto> getSalesPage(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "10") int size) {
        return saleService.getSalesPage(page,  size);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/statussales/{status}")
    public List<SaleDto> getSaleByStatus(@PathVariable Status status) {
        return saleService.getSaleByStatus(status);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pymethodsales/{paymentMethod}")
    public List<SaleDto> getSaleByPaymentMethod(@PathVariable PaymentMethod paymentMethod) {
        return saleService.getSalesByPaymentMethod(paymentMethod);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/updatestatus")
    public SaleDto updateStatus(@RequestParam Long saleId,  @RequestParam Status status) {
        return saleService.updateSaleStatus(saleId, status);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/updatesale/{saleId}")
    public SaleDto updateSale(@PathVariable Long saleId,  @RequestBody SaleDto saleDto) {
        return saleService.updateSale(saleId, saleDto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/salesbydate")
    public List<SaleDto> saleByDateRange(@RequestParam LocalDateTime startDate, @RequestParam LocalDateTime endDate) {
        return saleService.getSalesByDateRange(startDate, endDate);
    }

}
