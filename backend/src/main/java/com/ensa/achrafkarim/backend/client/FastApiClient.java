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

    public List<ChurnPredictionDto> predictChurn(List<ChurnInputDto> request) {
        String url = fastApiBaseUrl + "/api/v1/analytics/predict-churn";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<List<ChurnInputDto>> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<ChurnPredictionDto[]> response = restTemplate.postForEntity(
                    url,
                    entity,
                    ChurnPredictionDto[].class
            );
            return Arrays.asList(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to predict churn from FastAPI: " + e.getMessage(), e);
        }
    }

    public RankingPredictionDto predictRanking(RankingPredictionRequestDto request) {
        String url = fastApiBaseUrl + "/api/v1/analytics/predict-ranking";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<RankingPredictionRequestDto> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<RankingPredictionDto> response = restTemplate.postForEntity(
                    url,
                    entity,
                    RankingPredictionDto.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to predict ranking from FastAPI: " + e.getMessage(), e);
        }
    }

    public List<PotentialBestSellerDto> identifyBestSellers(List<BestSellerInputDto> request) {
        String url = fastApiBaseUrl + "/api/v1/analytics/identify-bestsellers";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<List<BestSellerInputDto>> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<PotentialBestSellerDto[]> response = restTemplate.postForEntity(
                    url,
                    entity,
                    PotentialBestSellerDto[].class
            );
            return Arrays.asList(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to identify best sellers from FastAPI: " + e.getMessage(), e);
        }
    }

    public List<StockoutPredictionDto> predictStockouts(List<StockoutInputDto> request) {
        String url = fastApiBaseUrl + "/api/v1/analytics/predict-stockouts";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<List<StockoutInputDto>> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<StockoutPredictionDto[]> response = restTemplate.postForEntity(
                    url,
                    entity,
                    StockoutPredictionDto[].class
            );
            return Arrays.asList(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to predict stockouts from FastAPI: " + e.getMessage(), e);
        }
    }

    public List<AnomalyDetectionDto> detectAnomalies(AnomalyDetectionRequestDto request) {
        String url = fastApiBaseUrl + "/api/v1/analytics/detect-anomalies";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<AnomalyDetectionRequestDto> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<AnomalyDetectionDto[]> response = restTemplate.postForEntity(
                    url,
                    entity,
                    AnomalyDetectionDto[].class
            );
            return Arrays.asList(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to detect anomalies from FastAPI: " + e.getMessage(), e);
        }
    }

    public List<TopicDto> extractTopics(TopicExtractionRequestDto request) {
        String url = fastApiBaseUrl + "/api/v1/analytics/extract-topics";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<TopicExtractionRequestDto> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<TopicDto[]> response = restTemplate.postForEntity(
                    url,
                    entity,
                    TopicDto[].class
            );
            return Arrays.asList(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract topics from FastAPI: " + e.getMessage(), e);
        }
    }

}