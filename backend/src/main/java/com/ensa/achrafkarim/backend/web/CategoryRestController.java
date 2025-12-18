package com.ensa.achrafkarim.backend.web;


import com.ensa.achrafkarim.backend.dto.CategoryDto;
import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.service.CategoryService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class CategoryRestController {

    private CategoryService categoryService;


    @GetMapping("/category/{categoryId}")
    public CategoryDto getCategories(@PathVariable Long categoryId) {
        return categoryService.getCategory(categoryId);
    }

    @GetMapping("/category/count")
    public Long getCategoriesCount() {
        return categoryService.getTotalCategoriesCount();
    }

    @GetMapping("/categories")
    public List<CategoryDto> getCategoriesList() {
        return categoryService.listCategories();
    }

    @GetMapping("/categoriespage")
    public Page<CategoryDto> getCategoriesPage(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "10") int size) {
        return categoryService.listCategoriesWithPagination(page,  size);
    }

    @GetMapping("/canDeleteCategory/{categoryId}")
    public boolean canDeleteCategory(@PathVariable Long categoryId) {
        return categoryService.canDeleteCategory(categoryId);
    }

    @DeleteMapping("/deleteCat/{categoryId}")
    public void deleteCategory(@PathVariable Long categoryId) {
        categoryService.deleteCategory(categoryId);
    }

    @PutMapping("/updateCategory/{categoryId}")
    public CategoryDto updateCategory(@PathVariable Long categoryId, @RequestBody CategoryDto categoryDto) {
        return categoryService.updateCategory(categoryId, categoryDto);
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
