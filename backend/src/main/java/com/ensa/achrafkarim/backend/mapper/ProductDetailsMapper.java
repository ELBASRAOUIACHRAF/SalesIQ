package com.ensa.achrafkarim.backend.mapper;


import com.ensa.achrafkarim.backend.dto.ProductDetailsDto;
import com.ensa.achrafkarim.backend.entities.Product;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductDetailsMapper {
    ProductDetailsDto toDto(Product product);
    Product toEntity(ProductDetailsDto dto);
}
