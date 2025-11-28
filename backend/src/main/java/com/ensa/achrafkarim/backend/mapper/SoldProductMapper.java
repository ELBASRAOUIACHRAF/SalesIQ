package com.ensa.achrafkarim.backend.mapper;

import com.ensa.achrafkarim.backend.dto.SoldProductDto;
import com.ensa.achrafkarim.backend.entities.SoldProduct;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SoldProductMapper {
    SoldProduct toEntity(SoldProductDto soldProductDto);
    SoldProductDto toDto(SoldProduct soldProduct);
}
