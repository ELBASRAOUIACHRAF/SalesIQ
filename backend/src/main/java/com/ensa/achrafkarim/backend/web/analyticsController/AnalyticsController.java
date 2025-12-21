package com.ensa.achrafkarim.backend.web.analyticsController;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.analyticsDto.SalesForecastDto;
import com.ensa.achrafkarim.backend.service.SaleService;
import com.ensa.achrafkarim.backend.service.analytics.AdvancedAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AdvancedAnalyticsService advancedAnalyticsService;
    private final SaleService saleService;

    @GetMapping("/forecastSales")
    public ResponseEntity<SalesForecastDto> getForecast(
            @RequestParam(defaultValue = "7") int daysAhead
    ){
        try {
            SalesForecastDto forecast = advancedAnalyticsService.forecastSales(daysAhead);
            return ResponseEntity.ok(forecast);
        }
        catch (Exception e) {
            System.err.println("Forecasting error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/segmentCustomers")
    public void segmentationOfCustomers(@RequestParam int nbSegments){
        advancedAnalyticsService.segmentCustomers(nbSegments);
    }

    @GetMapping("/similarProducts/{productId}")
    public List<ProductDto> getSimilarProducts(@PathVariable Long productId){
        return advancedAnalyticsService.getSimilarProductsByProduct(productId);
    }
}
