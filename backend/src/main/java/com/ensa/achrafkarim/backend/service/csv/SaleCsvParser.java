package com.ensa.achrafkarim.backend.service.csv;

import com.ensa.achrafkarim.backend.dto.csv.SaleCsvDto;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.PaymentMethod;
import com.ensa.achrafkarim.backend.enums.Status;
import com.ensa.achrafkarim.backend.repository.SaleRepository;
import com.ensa.achrafkarim.backend.repository.UsersRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class SaleCsvParser extends AbstractCsvParser<SaleCsvDto, Sale>{

    private final SaleRepository saleRepository;
    private final UsersRepository usersRepository;

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    protected Class<SaleCsvDto> getDtoClass() {
        return SaleCsvDto.class;
    }

    @Override
    protected List<SaleCsvDto> getAllDtos() {
        return saleRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Sale toEntity(SaleCsvDto dto) {
        Sale sale = new Sale();

        if (dto.getId() != null) {
            sale.setId(dto.getId());
        }

        // Parse date string to LocalDateTime
        if (dto.getDateOfSale() != null && !dto.getDateOfSale().isEmpty()) {
            sale.setDateOfSale(LocalDateTime.parse(dto.getDateOfSale(), DATE_FORMAT));
        } else {
            sale.setDateOfSale(LocalDateTime.now());
        }

        // Convert String to Enum
        if (dto.getPaymentMethod() != null && !dto.getPaymentMethod().isEmpty()) {
            sale.setPaymentMethod(PaymentMethod.valueOf(dto.getPaymentMethod().toUpperCase()));
        }

        if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
            sale.setStatus(Status.valueOf(dto.getStatus().toUpperCase()));
        }

        sale.setUpdatedAt(LocalDateTime.now());

        // RELATIONSHIP: Find user by email
        if (dto.getUserEmail() != null && !dto.getUserEmail().isEmpty()) {
            Users user = usersRepository.findByEmail(dto.getUserEmail());
            if (user == null) throw new RuntimeException("User not found");
            sale.setUsers(user);
        }
        return sale;
    }

    @Override
    public SaleCsvDto toDto(Sale entity) {
        SaleCsvDto dto = new SaleCsvDto();

        dto.setId(entity.getId());
        // Convert LocalDateTime to String
        if (entity.getDateOfSale() != null) {
            dto.setDateOfSale(entity.getDateOfSale().format(DATE_FORMAT));
        }
        // Convert Enum to String
        if (entity.getPaymentMethod() != null) {
            dto.setPaymentMethod(entity.getPaymentMethod().name());
        }
        if (entity.getStatus() != null) {
            dto.setStatus(entity.getStatus().name());
        }
        // Export user email
        if (entity.getUsers() != null) {
            dto.setUserEmail(entity.getUsers().getEmail());
        }
        return dto;
    }

    @Override
    @Transactional
    public int importCsv(MultipartFile file) throws Exception {
        List<SaleCsvDto> dtos = parseCsv(file);

        List<Sale> sales = dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());

        saleRepository.saveAll(sales);
        return sales.size();
    }
}
