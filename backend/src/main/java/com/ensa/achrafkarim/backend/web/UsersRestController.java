package com.ensa.achrafkarim.backend.web;


import com.ensa.achrafkarim.backend.repository.UsersRepository;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController("users")
@AllArgsConstructor
public class UsersRestController {

    UsersRepository usersRepository;


}
