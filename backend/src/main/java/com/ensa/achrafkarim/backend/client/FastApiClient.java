package com.ensa.achrafkarim.backend.client;

import com.ensa.achrafkarim.backend.dto.analyticsDto.SalesForecastDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class FastApiClient {

    private final RestTemplate restTemplate;

    @Value("${fastapi.base.url}")
    private String fastApiBaseUrl;

    public FastApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public SalesForecastDto getForecast(SalesForecastDto request) {
        String url = fastApiBaseUrl + "/api/v1/analytics/forecastSales";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<SalesForecastDto> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<SalesForecastDto> response = restTemplate.postForEntity(
                    url,
                    entity,
                    SalesForecastDto.class
            );

            return response.getBody();

        } catch (Exception e) {
            throw new RuntimeException("Failed to get forecast from FastAPI: " + e.getMessage(), e);
        }
    }
}