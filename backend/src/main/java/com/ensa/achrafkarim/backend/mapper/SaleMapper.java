package com.ensa.achrafkarim.backend.mapper;

import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.entities.Sale;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SaleMapper {
    Sale toEntity(SaleDto saleDto);
    SaleDto toDto(Sale sale);
}
