package com.ensa.achrafkarim.backend.web;


import com.ensa.achrafkarim.backend.dto.AuthDto.LoginRequestDto;
import com.ensa.achrafkarim.backend.dto.AuthDto.LoginResponseDto;
import com.ensa.achrafkarim.backend.dto.RegistrationDto;
import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.repository.UsersRepository;
import com.ensa.achrafkarim.backend.security.service.JwtService;
import com.ensa.achrafkarim.backend.security.service.UserDetailsServiceImpl;
import com.ensa.achrafkarim.backend.service.UsersService;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
//@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@AllArgsConstructor
public class AuthRestController {

    private final UsersRepository usersRepository;
    UserDetailsServiceImpl userDetailsService;
    JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UsersService usersService;

    @PostMapping("/login")
    public LoginResponseDto login(@RequestBody LoginRequestDto loginRequestDto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDto.getEmail(),
                        loginRequestDto.getPassword()
                )
        );
        UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequestDto.getEmail());

        Users user = usersRepository.findByEmail(loginRequestDto.getEmail());


        String token = jwtService.generateToken(userDetails, user.getId());
        return new LoginResponseDto(token);
    }

    @PostMapping("/register")
    public void register(@RequestBody RegistrationDto registrationDto) {
        usersService.register(registrationDto);
    }

}
