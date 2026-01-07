package com.ensa.achrafkarim.backend.web.csv;

import com.ensa.achrafkarim.backend.service.csv.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/csv")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class CsvController {

    private final CategoryCsvParser categoryCsvParser;
    private final ProductCsvParser productCsvParser;
    private final SaleCsvParser saleCsvParser;
    private final UserCsvParser usersCsvParser;
    private final SoldProductCsvParser soldProductCsvParser;
    private final SearchHistoryCsvParser searchHistoryCsvParser;
    private final ReviewsCsvParser reviewsCsvParser;
    private final BasketCsvParser basketCsvParser;

    // ============ CATEGORY ============

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @PostMapping("/categories/import")
    public ResponseEntity<Map<String, Object>> importCategories(
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = categoryCsvParser.importCsv(file);
            response.put("success", true);
            response.put("message", "Imported " + count + " categories");
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Import failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/categories/export")
    public ResponseEntity<byte[]> exportCategories() {
        try {
            byte[] csvBytes = categoryCsvParser.exportCsv();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=categories.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ============ PRODUCT ============

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @PostMapping("/products/import")
    public ResponseEntity<Map<String, Object>> importProducts(
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = productCsvParser.importCsv(file);
            response.put("success", true);
            response.put("message", "Imported " + count + " products");
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Import failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/products/export")
    public ResponseEntity<byte[]> exportProducts() {
        try {
            byte[] csvBytes = productCsvParser.exportCsv();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=products.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ============ SALE ============

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @PostMapping("/sales/import")
    public ResponseEntity<Map<String, Object>> importSales(
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = saleCsvParser.importCsv(file);
            response.put("success", true);
            response.put("message", "Imported " + count + " sales");
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Import failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/sales/export")
    public ResponseEntity<byte[]> exportSales() {
        try {
            byte[] csvBytes = saleCsvParser.exportCsv();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ============ USERS ============

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @PostMapping("/users/import")
    public ResponseEntity<Map<String, Object>> importUsers(
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = usersCsvParser.importCsv(file);
            response.put("success", true);
            response.put("message", "Imported " + count + " users");
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Import failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/users/export")
    public ResponseEntity<byte[]> exportUsers() {
        try {
            byte[] csvBytes = usersCsvParser.exportCsv();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        } catch (Exception e) {
            log.error("Error exporting users CSV: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ============ SOLD PRODUCT ============

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @PostMapping("/sold-products/import")
    public ResponseEntity<Map<String, Object>> importSoldProducts(
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = soldProductCsvParser.importCsv(file);
            response.put("success", true);
            response.put("message", "Imported " + count + " sold products");
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Import failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/sold-products/export")
    public ResponseEntity<byte[]> exportSoldProducts() {
        try {
            byte[] csvBytes = soldProductCsvParser.exportCsv();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sold-products.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ============ SEARCH HISTORY ============

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @PostMapping("/search-history/import")
    public ResponseEntity<Map<String, Object>> importSearchHistory(
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = searchHistoryCsvParser.importCsv(file);
            response.put("success", true);
            response.put("message", "Imported " + count + " search history records");
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Import failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/search-history/export")
    public ResponseEntity<byte[]> exportSearchHistory() {
        try {
            byte[] csvBytes = searchHistoryCsvParser.exportCsv();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=search-history.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ============ REVIEWS ============

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @PostMapping("/reviews/import")
    public ResponseEntity<Map<String, Object>> importReviews(
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = reviewsCsvParser.importCsv(file);
            response.put("success", true);
            response.put("message", "Imported " + count + " reviews");
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Import failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/reviews/export")
    public ResponseEntity<byte[]> exportReviews() {
        try {
            byte[] csvBytes = reviewsCsvParser.exportCsv();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reviews.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ============ BASKET ============

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @PostMapping("/baskets/import")
    public ResponseEntity<Map<String, Object>> importBaskets(
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = basketCsvParser.importCsv(file);
            response.put("success", true);
            response.put("message", "Imported " + count + " baskets");
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Import failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/baskets/export")
    public ResponseEntity<byte[]> exportBaskets() {
        try {
            byte[] csvBytes = basketCsvParser.exportCsv();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=baskets.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}