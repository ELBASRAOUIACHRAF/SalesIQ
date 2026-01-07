package com.ensa.achrafkarim.backend.dto.AuthDto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDto {
    private String token;
}
