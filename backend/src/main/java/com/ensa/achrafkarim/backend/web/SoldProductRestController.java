package com.ensa.achrafkarim.backend.web;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.dto.SoldProductDto;
import com.ensa.achrafkarim.backend.service.SoldProductService;
import com.ensa.achrafkarim.backend.service.SoldProductServiceImpl;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("SoldProduct")
@AllArgsConstructor
public class SoldProductRestController {

    private SoldProductService soldProductService;

    @GetMapping("/getSoldProductsBySale/{saleId}")
    public List<ProductDto> getSoldProductsBySale(@PathVariable Long saleId)
    {
        return (soldProductService.getSoldProductsBySale(saleId));
    }

    @GetMapping("/getTotalPriceBySale/{saleId}")
    public Double getTotalPriceBySale(@PathVariable Long saleId)
    {
        return (soldProductService.getTotalPriceBySale(saleId));
    }

    @GetMapping("/getProfitByProduct/{saleId}")
    public double getProfitByProduct(@PathVariable Long saleId)
    {
        return (soldProductService.getProfitByProduct(saleId));
    }

    @GetMapping("/addSoldProduct/{saleId}")
    public SoldProductDto addSoldProduct(Long saleId, Long productId, int quantity, Double unitPrice) {

    }
