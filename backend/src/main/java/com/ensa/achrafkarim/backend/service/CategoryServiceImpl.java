package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.CategoryDto;
import com.ensa.achrafkarim.backend.entities.Category;
import com.ensa.achrafkarim.backend.mapper.CategoryMapper;
import com.ensa.achrafkarim.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private CategoryRepository categoryRepository;
    private CategoryMapper categoryMapper;

    public CategoryServiceImpl(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Override
    public CategoryDto createCategory(CategoryDto categoryDto) {
        Category category = categoryMapper.toEntity(categoryDto);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        category.setActive(true);
        Category categorySaved = categoryRepository.save(category);
        return categoryMapper.toDto(categorySaved);
    }

    @Override
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) return null;  // une exception si la categorie n'existe pas
        category.setUpdatedAt(LocalDateTime.now());
        category.setName(categoryDto.getName());
        category.setDescription(categoryDto.getDescription());
        Category categoryUpdated = categoryRepository.save(category);
        return categoryMapper.toDto(categoryUpdated);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) return;  // une exception si la categorie n'existe pas
        categoryRepository.deleteById(id);
    }

    @Override
    public CategoryDto getCategory(Long id) {
        Category category = categoryRepository.findById(id).orElse(null);
        return categoryMapper.toDto(category);
    }

    @Override
    public List<CategoryDto> listCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryDto> categoryDtos = categories.stream()
                .map(cat -> categoryMapper.toDto(cat))
                .collect(Collectors.toList());
        return categoryDtos;
    }

    @Override
    public CategoryDto activateCategory(Long id) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) return null;
        category.setActive(true);
        Category updatedCat = categoryRepository.save(category);
        return categoryMapper.toDto(updatedCat);
    }

    @Override
    public CategoryDto deactivateCategory(Long id) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) return null;
        category.setActive(false);
        Category updatedCat = categoryRepository.save(category);
        return categoryMapper.toDto(updatedCat);
    }

}
