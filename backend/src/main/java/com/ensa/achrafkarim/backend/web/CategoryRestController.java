package com.ensa.achrafkarim.backend.web;


import com.ensa.achrafkarim.backend.dto.CategoryDto;
import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.service.CategoryService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
public class CategoryRestController {

    private CategoryService categoryService;


    @GetMapping("/category/{categoryId}")
    public CategoryDto getCategories(@PathVariable Long categoryId) {
        return categoryService.getCategory(categoryId);
    }

    @GetMapping("/categories")
    public List<CategoryDto> getProductsList() {
        return categoryService.listCategories();
    }

    @DeleteMapping("/deleteCat/{categoryId}")
    public void deleteCategory(Long categoryId) {
        categoryService.deleteCategory(categoryId);
    }

    @PostMapping("/addCategory")
    public CategoryDto addCategory(@RequestBody CategoryDto categoryDto) {
        return categoryService.createCategory(categoryDto);
    }

    @PutMapping("/category/{categoryId}/activate")
    public CategoryDto activateCategory(@PathVariable Long categoryId) {
        return categoryService.activateCategory(categoryId);
    }

    @PutMapping("/category/{categoryId}/deactivate")
    public CategoryDto deActivateCategory(@PathVariable Long categoryId) {
        return categoryService.deactivateCategory(categoryId);
    }

}
