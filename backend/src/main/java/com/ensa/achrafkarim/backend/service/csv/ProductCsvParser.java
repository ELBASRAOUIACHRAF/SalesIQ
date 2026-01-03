package com.ensa.achrafkarim.backend.service.csv;

import com.ensa.achrafkarim.backend.dto.csv.ProductCsvDto;
import com.ensa.achrafkarim.backend.entities.Category;
import com.ensa.achrafkarim.backend.entities.Product;
import com.ensa.achrafkarim.backend.repository.CategoryRepository;
import com.ensa.achrafkarim.backend.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class ProductCsvParser extends AbstractCsvParser<ProductCsvDto, Product>{

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    protected Class<ProductCsvDto> getDtoClass() {
        return ProductCsvDto.class;
    }

    @Override
    protected List<ProductCsvDto> getAllDtos() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public Product toEntity(ProductCsvDto dto) {
        Product product = new Product();

        if (dto.getId() != null)
            product.setId(dto.getId());
        product.setName(dto.getName());
        product.setPrice(dto.getPrice() != null ? dto.getPrice() : 0.0);
        product.setAsin(dto.getAsin());
        product.setDescription(dto.getDescription());
        product.setMark(dto.getMark());
        product.setDiscount(dto.getDiscount() != null ? dto.getDiscount() : 0.0);
        product.setStock(dto.getStock() != null ? dto.getStock() : 0L);
        product.setImageUrl(dto.getImageUrl());
        product.setWeight(dto.getWeight() != null ? dto.getWeight() : 0.0);
        product.setLength(dto.getLength() != null ? dto.getLength() : 0.0);
        product.setHeight(dto.getHeight() != null ? dto.getHeight() : 0.0);
        product.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        // RELATIONSHIP HANDLING:
        // Look up Category by name from the CSV
        if (dto.getCategoryName() != null && !dto.getCategoryName().isEmpty()) {
            Category category = categoryRepository.findByName(dto.getCategoryName());
            if (category == null) throw new RuntimeException("Category name not found");
            product.setCategory(category);
        }

        return product;
    }

    @Override
    public ProductCsvDto toDto(Product entity) {
        ProductCsvDto dto = new ProductCsvDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setPrice(entity.getPrice());
        dto.setAsin(entity.getAsin());
        dto.setDescription(entity.getDescription());
        dto.setMark(entity.getMark());
        dto.setDiscount(entity.getDiscount());
        dto.setStock(entity.getStock());
        dto.setImageUrl(entity.getImageUrl());
        dto.setWeight(entity.getWeight());
        dto.setLength(entity.getLength());
        dto.setHeight(entity.getHeight());
        dto.setIsActive(entity.getIsActive());

        if (entity.getCategory() != null) {
            dto.setCategoryName(entity.getCategory().getName());
        }

        return dto;
    }

    @Override
    @Transactional
    public int importCsv(MultipartFile file) throws Exception {
        List<ProductCsvDto> dtos = parseCsv(file);

        List<Product> products = dtos.stream().map(this::toEntity).toList();
        productRepository.saveAll(products);
        return products.size();
    }
}
