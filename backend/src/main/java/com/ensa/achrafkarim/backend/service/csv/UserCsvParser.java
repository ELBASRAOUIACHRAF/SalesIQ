package com.ensa.achrafkarim.backend.service.csv;

import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.Role;
import com.ensa.achrafkarim.backend.enums.Segment;
import com.ensa.achrafkarim.backend.repository.UsersRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.ensa.achrafkarim.backend.csv.dto.UserCsvDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserCsvParser extends AbstractCsvParser<UserCsvDto, Users> {

    private final UsersRepository usersRepository;

    @Override
    protected Class<UserCsvDto> getDtoClass() {
        return com.ensa.achrafkarim.backend.csv.dto.UserCsvDto.class;
    }

    @Override
    protected List<com.ensa.achrafkarim.backend.csv.dto.UserCsvDto> getAllDtos() {
        return usersRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Users toEntity(com.ensa.achrafkarim.backend.csv.dto.UserCsvDto dto) {
        Users user = new Users();

        if (dto.getId() != null) {
            user.setId(dto.getId());
        }

        user.setUsername(dto.getUsername());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setPhoneNumber(dto.getPhoneNumber());

        if (dto.getRole() != null && !dto.getRole().isEmpty()) {
            user.setRole(Role.valueOf(dto.getRole().toUpperCase()));
        }

        user.setHoursLoggedIn(dto.getHoursLoggedIn() != null ? dto.getHoursLoggedIn() : 0.0);
        user.setActive(dto.getActive() != null ? dto.getActive() : true);
        user.setBio(dto.getBio());
        user.setCountry(dto.getCountry());
        user.setCity(dto.getCity());
        user.setPostalCode(dto.getPostalCode());

        if (dto.getSegment() != null && !dto.getSegment().isEmpty()) {
            user.setSegment(Segment.valueOf(dto.getSegment().toUpperCase()));
        }

        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return user;
    }

    @Override
    public com.ensa.achrafkarim.backend.csv.dto.UserCsvDto toDto(Users entity) {
        com.ensa.achrafkarim.backend.csv.dto.UserCsvDto dto = new com.ensa.achrafkarim.backend.csv.dto.UserCsvDto();

        dto.setId(entity.getId());
        dto.setUsername(entity.getUsername());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setEmail(entity.getEmail());
        dto.setPassword("********");
        dto.setPhoneNumber(entity.getPhoneNumber());

        if (entity.getRole() != null) {
            dto.setRole(entity.getRole().name());
        }

        dto.setHoursLoggedIn(entity.getHoursLoggedIn());
        dto.setActive(entity.isActive());
        dto.setBio(entity.getBio());
        dto.setCountry(entity.getCountry());
        dto.setCity(entity.getCity());
        dto.setPostalCode(entity.getPostalCode());

        if (entity.getSegment() != null) {
            dto.setSegment(entity.getSegment().name());
        }

        return dto;
    }

    @Override
    @Transactional
    public int importCsv(MultipartFile file) throws Exception {
        List<com.ensa.achrafkarim.backend.csv.dto.UserCsvDto> dtos = parseCsv(file);

        List<Users> users = dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());

        usersRepository.saveAll(users);
        return users.size();
    }
}