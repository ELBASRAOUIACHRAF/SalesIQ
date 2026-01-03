package com.ensa.achrafkarim.backend.client;

import com.ensa.achrafkarim.backend.dto.analyticsDto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

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

    //performMarketBasketAnalysis
    public List<AssociationRuleDto> performMarketBasketAnalysis(
            double minSupport,
            double minConfidence,
            List<Map<Long, Integer>> transactions
    ) {
        String url = fastApiBaseUrl + "/api/v1/analytics/marketBasketAnalysis";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        MarketBasketRequestDto request = new MarketBasketRequestDto(minSupport, minConfidence, transactions);
        HttpEntity<MarketBasketRequestDto> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<AssociationRuleDto[]> response = restTemplate.postForEntity(
                    url,
                    entity,
                    AssociationRuleDto[].class
            );
            return Arrays.asList(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get forecast from FastAPI: " + e.getMessage(), e);
        }

    }

    public List<RFMSegmentDto> performRFMAnalysis(
            List<RFMInputDto> request
    ) {
        String url = fastApiBaseUrl + "/api/v1/analytics/rfm";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<List<RFMInputDto>> entity =
                new HttpEntity<>(request, headers);

        try {
            ResponseEntity<RFMSegmentDto[]> response =
                    restTemplate.postForEntity(
                            url,
                            entity,
                            RFMSegmentDto[].class
                    );

            return Arrays.asList(response.getBody());

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to perform RFM analysis: " + e.getMessage(), e
            );
        }
    }

}