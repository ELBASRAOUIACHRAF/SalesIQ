package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsersRepository extends JpaRepository<Users, Long> {

}
