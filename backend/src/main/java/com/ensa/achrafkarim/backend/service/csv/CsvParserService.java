package com.ensa.achrafkarim.backend.service.csv;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CsvParserService<D, E> {
    /**
     * Parse CSV file and return list of DTOs
     */
    List<D> parseCsv(MultipartFile file) throws Exception;

    /**
     * Convert DTO to Entity (handles relationships)
     */
    E toEntity(D dto);

    /**
     * Convert Entity to DTO (for export)
     */
    D toDto(E entity);

    /**
     * Import: Parse CSV → Convert to Entities → Save to DB
     * Returns number of records imported
     */
    int importCsv(MultipartFile file) throws Exception;

    /**
     * Export: Fetch from DB → Convert to DTOs → Write CSV
     */
    byte[] exportCsv() throws Exception;

}
