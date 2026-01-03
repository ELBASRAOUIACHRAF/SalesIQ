package com.ensa.achrafkarim.backend.service.csv;

import com.ensa.achrafkarim.backend.dto.csv.CategoryCsvDto;
import com.ensa.achrafkarim.backend.entities.Category;
import com.ensa.achrafkarim.backend.repository.CategoryRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CategoryCsvParser extends AbstractCsvParser <CategoryCsvDto, Category> {

    private final CategoryRepository categoryRepository;

    @Override
    protected Class<CategoryCsvDto> getDtoClass() {
        return CategoryCsvDto.class;
    }

    @Override
    protected List<CategoryCsvDto> getAllDtos() {
        return categoryRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Category toEntity(CategoryCsvDto dto) {
        Category category = new Category();

        // in case the dto alrdy exists, we just wanna update
        // and leave the same id
        if (dto.getId() != null) {
            category.setId(dto.getId());
        }
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());

        return category;
    }

    @Override
    public CategoryCsvDto toDto(Category entity) {
        CategoryCsvDto dto = new CategoryCsvDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setIsActive(entity.isActive());
        return dto;
    }

    @Override
    @Transactional
    public int importCsv(MultipartFile file) throws Exception {
        List<CategoryCsvDto> dtos = parseCsv(file);

        List<Category> categories = dtos.stream()
                .map(this::toEntity)
                .toList();

        categoryRepository.saveAll(categories);
        return categories.size();
    }
}
