package com.ensa.achrafkarim.backend.web;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.dto.SoldProductDto;
import com.ensa.achrafkarim.backend.service.SoldProductService;
import com.ensa.achrafkarim.backend.service.SoldProductServiceImpl;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("SoldProduct")
@AllArgsConstructor
public class SoldProductRestController {

    private SoldProductService soldProductService;

    @GetMapping("/getSoldProductsBySale/{saleId}")
    public List<ProductDto> getSoldProductsBySale(@PathVariable Long saleId) {
        return (soldProductService.getSoldProductsBySale(saleId));
    }

    @GetMapping("/getTotalPriceBySale/{saleId}")
    public Double getTotalPriceBySale(@PathVariable Long saleId) {
        return (soldProductService.getTotalPriceBySale(saleId));
    }

    @GetMapping("/getProfitByProduct/{saleId}")
    public double getProfitByProduct(@PathVariable Long saleId) {
        return (soldProductService.getProfitByProduct(saleId));
    }

    @PostMapping("/addSoldProduct")
    public SoldProductDto addSoldProduct(
            @RequestParam Long saleId,
            @RequestParam Long productId,
            @RequestParam int quantity,
            @RequestParam Double unitprice
    ) {
        return (soldProductService.addSoldProduct(saleId, productId, quantity, unitprice));
    }
}
