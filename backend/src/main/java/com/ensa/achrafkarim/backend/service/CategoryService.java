package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.CategoryDto;

import java.util.List;

public interface CategoryService {

    CategoryDto createCategory(CategoryDto categoryDto);
    CategoryDto updateCategory(Long id, CategoryDto categoryDto);
    void deleteCategory(Long id);
    CategoryDto getCategory(Long id);
    List<CategoryDto> listCategories();


}
