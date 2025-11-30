package com.ensa.achrafkarim.backend.mapper;

import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.entities.Users;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UsersMapper {
    UsersDto toDto(Users users);
    Users toEntity(UsersDto usersDto);
}
