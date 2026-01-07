package com.ensa.achrafkarim.backend.mapper;

import com.ensa.achrafkarim.backend.dto.CategoryDto;
import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.entities.Category;
import com.ensa.achrafkarim.backend.entities.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(source = "isActive", target = "isActive")
    CategoryDto toDto(Category category);
    
    @Mapping(source = "isActive", target = "isActive")
    Category toEntity(CategoryDto dto);
}
