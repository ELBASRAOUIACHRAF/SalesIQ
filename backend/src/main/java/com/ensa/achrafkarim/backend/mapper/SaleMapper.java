package com.ensa.achrafkarim.backend.mapper;

import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.entities.SoldProduct;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface SaleMapper {
    Sale toEntity(SaleDto saleDto);
    
    @Mapping(target = "totalAmount", source = "sale", qualifiedByName = "calculateTotalAmount")
    @Mapping(target = "userId", source = "users.id")
    SaleDto toDto(Sale sale);
    
    @Named("calculateTotalAmount")
    default Double calculateTotalAmount(Sale sale) {
        if (sale.getSoldProducts() == null || sale.getSoldProducts().isEmpty()) {
            return 0.0;
        }
        return sale.getSoldProducts().stream()
                .mapToDouble(sp -> sp.getQuantity() * sp.getUnitPrice())
                .sum();
    }
}
