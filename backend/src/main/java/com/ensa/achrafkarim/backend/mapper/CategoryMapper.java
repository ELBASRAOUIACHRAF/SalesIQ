package com.ensa.achrafkarim.backend.mapper;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.entities.Product;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    ProductDto toDto(Product product);
    Product toEntity(ProductDto dto);
}
