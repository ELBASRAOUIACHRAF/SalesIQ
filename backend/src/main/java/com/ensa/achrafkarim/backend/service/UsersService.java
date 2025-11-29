package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.enums.Role;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

public interface UsersService {
    UsersDto addUsers(UsersDto usersDto);
    UsersDto updateUsers(UsersDto usersDto);
    void deleteUsers(Long usersId);
    UsersDto getUsers(Long usersId);
    List<UsersDto> getAllUsers();
    List<UsersDto> getUsersByRole(Role role);
    LocalDateTime getLastLogin(Long usersId);
    UsersDto getUserByEmail(String email);
    UsersDto changePassword(Long usersId, String newPassword);
    Page<UsersDto> getUsersPage(int page, int size);
    List<UsersDto> getActiveOrInActiveUsers(boolean active);
    long countUsersByRole(Role role);
    long countTotalUsers();
    List<UsersDto> searchUsersByUsername(String username);
    void updateLastLogin(Long usersId);
    long getDaysSinceLastLogin(Long usersId);
    UsersDto resetPassword(String email);
    UsersDto addRoleToUser(Long usersId, Role role);
    UsersDto activateUser(Long usersId);
    UsersDto deactivateUser(Long usersId);

    void updateHoursLoggedIn(Long usersId);
}
