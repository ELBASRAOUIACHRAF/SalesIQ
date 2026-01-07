package com.ensa.achrafkarim.backend.web;

import com.ensa.achrafkarim.backend.dto.*;
import com.ensa.achrafkarim.backend.service.SoldProductService;
import com.ensa.achrafkarim.backend.service.SoldProductServiceImpl;
import com.ensa.achrafkarim.backend.service.UsersService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("SoldProduct")
//@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@AllArgsConstructor
public class SoldProductRestController {

    private final SoldProductService soldProductService;
    private final UsersService usersService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getSoldProductsBySale/{saleId}")
    public List<ProductDto> getProductsSoldBySale(@PathVariable Long saleId) {
        return soldProductService.getSoldProductsBySale(saleId);
    }

    @GetMapping("/getSoldProductsBySalesUser/{saleId}")
    public ResponseEntity<List<ProductDto>> getProductsSoldBySalesUser(@PathVariable Long saleId, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        UsersDto user = usersService.getUserByEmail(principal.getName());

        // Assurez-vous que cette méthode existe dans le service et vérifie l'userId
        return ResponseEntity.ok(soldProductService.getSoldProductsBySalesUser(saleId, user.getId()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getTotalPriceBySale/{saleId}")
    public Double getTotalPriceBySale(@PathVariable Long saleId) {
        return (soldProductService.getTotalPriceBySale(saleId));
    }

    @GetMapping("/getTotalPriceBySaleAndUser/{saleId}")
    public ResponseEntity<Double> getTotalPriceBySalesUser(@PathVariable Long saleId, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        UsersDto user = usersService.getUserByEmail(principal.getName());

        return ResponseEntity.ok(soldProductService.getTotalPriceBySalesUser(saleId, user.getId()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getProfitByProduct/{productId}")
    public double getProfitByProduct(@PathVariable Long productId) {
        return (soldProductService.getProfitByProduct(productId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/addSoldProduct")
    public SoldProductDto addSoldProduct(
            @RequestParam Long saleId,
            @RequestParam Long productId,
            @RequestParam int quantity,
            @RequestParam Double unitPrice
    ) {
        ProductOrderInfoDto productOrderInfoDto = new ProductOrderInfoDto(productId,quantity,unitPrice);
        return (soldProductService.addSoldProduct(saleId, productOrderInfoDto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/deleteSoldProduct/{saleId}")
    public void deleteSoldProduct(@PathVariable Long saleId) {
        soldProductService.deleteSoldProduct(saleId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getTotalQuantitySoldByProduct/{productId}")
    public int  getTotalQuantitySoldByProduct(@PathVariable Long productId) {
        return (soldProductService.getTotalQuantitySoldByProduct(productId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getNumberOfTimesSold/{productId}")
    public long getNumberOfTimesSold(@PathVariable Long productId) {
        return (soldProductService.getNumberOfTimesSold(productId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getProductProfitBySaleProductIds")
    public double getProductProfitBySaleProductIds(
            @RequestParam Long saleId,
            @RequestParam Long productId
    ) {
        return (soldProductService.getProductProfitBySaleProductIds(saleId, productId));
    }
    // A Modifier ---------------------------------------------------
    @GetMapping("/soldproductsbysale/{saleId}")
    public List<SoldProductDto> getSoldProductsBySale(@PathVariable Long saleId) {
        return soldProductService.getAllSoldProductsBySale(saleId);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/totalAmounts")
    public Double getTotalAmount() {
        return soldProductService.getTotalSalesAmount();
    }
}
