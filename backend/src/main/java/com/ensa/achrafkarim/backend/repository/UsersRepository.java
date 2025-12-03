package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsersRepository extends JpaRepository<Users, Long> {

    List<Users> findByRole(Role role);
    Users findByEmail(String email);
    List<Users> findByActive(boolean active);
    List<Users> findByUsernameContaining(String username);

    boolean existsByEmail(String email);
}
