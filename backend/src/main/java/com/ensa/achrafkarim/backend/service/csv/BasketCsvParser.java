package com.ensa.achrafkarim.backend.service.csv;

import com.ensa.achrafkarim.backend.dto.csv.BasketCsvDto;
import com.ensa.achrafkarim.backend.entities.Basket;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.repository.BasketRepository;
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
public class BasketCsvParser extends AbstractCsvParser<BasketCsvDto, Basket> {

    private final BasketRepository basketRepository;
    private final UsersRepository usersRepository;

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    protected Class<BasketCsvDto> getDtoClass() {
        return BasketCsvDto.class;
    }

    @Override
    protected List<BasketCsvDto> getAllDtos() {
        return basketRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Basket toEntity(BasketCsvDto dto) {
        Basket basket = new Basket();

        if (dto.getId() != null) {
            basket.setId(dto.getId());
        }

        if (dto.getUserEmail() != null && !dto.getUserEmail().isEmpty()) {
            Users user = usersRepository.findByEmail(dto.getUserEmail());
            if (user == null) throw new RuntimeException("User not found: " + dto.getUserEmail());
            basket.setUser(user);
        }

        if (dto.getCreatedAt() != null && !dto.getCreatedAt().isEmpty()) {
            basket.setCreatedAt(LocalDateTime.parse(dto.getCreatedAt(), DATE_FORMAT));
        } else {
            basket.setCreatedAt(LocalDateTime.now());
        }

        if (dto.getUpdatedAt() != null && !dto.getUpdatedAt().isEmpty()) {
            basket.setUpdatedAt(LocalDateTime.parse(dto.getUpdatedAt(), DATE_FORMAT));
        }

        return basket;
    }

    @Override
    public BasketCsvDto toDto(Basket entity) {
        BasketCsvDto dto = new BasketCsvDto();

        dto.setId(entity.getId());

        if (entity.getUser() != null) {
            dto.setUserEmail(entity.getUser().getEmail());
        }

        if (entity.getCreatedAt() != null) {
            dto.setCreatedAt(entity.getCreatedAt().format(DATE_FORMAT));
        }

        if (entity.getUpdatedAt() != null) {
            dto.setUpdatedAt(entity.getUpdatedAt().format(DATE_FORMAT));
        }

        return dto;
    }

    @Override
    @Transactional
    public int importCsv(MultipartFile file) throws Exception {
        List<BasketCsvDto> dtos = parseCsv(file);

        List<Basket> baskets = dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());

        basketRepository.saveAll(baskets);
        return baskets.size();
    }
}