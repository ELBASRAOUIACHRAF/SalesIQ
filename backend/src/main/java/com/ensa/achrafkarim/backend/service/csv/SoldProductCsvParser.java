package com.ensa.achrafkarim.backend.service.csv;

import com.ensa.achrafkarim.backend.dto.csv.SoldProductCsvDto;
import com.ensa.achrafkarim.backend.entities.Product;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.entities.SoldProduct;
import com.ensa.achrafkarim.backend.repository.ProductRepository;
import com.ensa.achrafkarim.backend.repository.SaleRepository;
import com.ensa.achrafkarim.backend.repository.SoldProductRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class SoldProductCsvParser extends AbstractCsvParser<SoldProductCsvDto, SoldProduct> {

    private final SoldProductRepository soldProductRepository;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    @Override
    protected Class<SoldProductCsvDto> getDtoClass() {
        return SoldProductCsvDto.class;
    }

    @Override
    protected List<SoldProductCsvDto> getAllDtos() {
        return soldProductRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public SoldProduct toEntity(SoldProductCsvDto dto) {
        SoldProduct soldProduct = new SoldProduct();

        if (dto.getId() != null) {
            soldProduct.setId(dto.getId());
        }

        soldProduct.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 0);
        soldProduct.setUnitPrice(dto.getUnitPrice() != null ? dto.getUnitPrice() : 0.0);

        if (dto.getProductName() != null && !dto.getProductName().isEmpty()) {
            Product product = productRepository.findByName(dto.getProductName());
            if (product == null) throw new RuntimeException("Product not found: " + dto.getProductName());
            soldProduct.setProduct(product);
        }

        if (dto.getSaleId() != null) {
            Sale sale = saleRepository.findById(dto.getSaleId())
                    .orElseThrow(() -> new RuntimeException("Sale not found: " + dto.getSaleId()));
            soldProduct.setSale(sale);
        }

        return soldProduct;
    }

    @Override
    public SoldProductCsvDto toDto(SoldProduct entity) {
        SoldProductCsvDto dto = new SoldProductCsvDto();

        dto.setId(entity.getId());
        dto.setQuantity(entity.getQuantity());
        dto.setUnitPrice(entity.getUnitPrice());

        if (entity.getProduct() != null) {
            dto.setProductName(entity.getProduct().getName());
        }

        if (entity.getSale() != null) {
            dto.setSaleId(entity.getSale().getId());
        }

        return dto;
    }

    @Override
    @Transactional
    public int importCsv(MultipartFile file) throws Exception {
        List<SoldProductCsvDto> dtos = parseCsv(file);

        List<SoldProduct> soldProducts = dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());

        soldProductRepository.saveAll(soldProducts);
        return soldProducts.size();
    }
}