package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.CategoryDetailsDto;
import com.ensa.achrafkarim.backend.dto.CategoryDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface CategoryService {

    CategoryDto createCategory(CategoryDto categoryDto);
    CategoryDto updateCategory(Long id, CategoryDto categoryDto);
    void deleteCategory(Long id);
    CategoryDto getCategory(Long id);
    List<CategoryDto> listCategories();
    CategoryDto activateCategory(Long id);
    CategoryDto deactivateCategory(Long id);
    Long getTotalCategoriesCount();
    Page<CategoryDto> listCategoriesWithPagination(int page, int size);
    boolean canDeleteCategory(Long id);

    List<CategoryDetailsDto> listCategoriesDetails();
}
