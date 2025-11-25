package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}
