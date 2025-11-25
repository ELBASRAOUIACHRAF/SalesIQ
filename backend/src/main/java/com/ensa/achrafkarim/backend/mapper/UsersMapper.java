package com.ensa.achrafkarim.backend.mapper;

import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.entities.Users;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UsersMapper {
    UsersDto toDto(Users user);
    Users toEntity(UsersDto dto);
}
