package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.Role;
import com.ensa.achrafkarim.backend.mapper.UsersMapper;
import com.ensa.achrafkarim.backend.repository.UsersRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UsersServiceImpl implements UsersService{

    UsersRepository  usersRepository;
    UsersMapper  usersMapper;


    @Override
    public UsersDto addUsers(UsersDto usersDto) {
        Users user =  usersMapper.toEntity(usersDto);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setHoursLoggedIn(0);
        user.setActive(true);

        Users savedUser = usersRepository.save(user);
        return usersMapper.toDto(savedUser);
    }

    @Override
    public UsersDto updateUsers(UsersDto usersDto) {
        return null;
    }

    @Override
    public void deleteUsers(Long usersId) {
        if (!usersRepository.existsById(usersId)) return ;
        usersRepository.deleteById(usersId);
    }

    @Override
    public UsersDto getUsers(Long usersId) {
        Users user = usersRepository.findById(usersId).get();
        return usersMapper.toDto(user);
    }

    @Override
    public List<UsersDto> getAllUsers() {
        List<Users> users = usersRepository.findAll();
        return users.stream()
                .map(user -> usersMapper.toDto(user))
                .collect(Collectors.toList());
    }

    @Override
    public List<UsersDto> getUsersByRole(Role role) {
        List<Users> users = usersRepository.findByRole(role);
        return users.stream()
                .map(user -> usersMapper.toDto(user))
                .collect(Collectors.toList());
    }

    @Override
    public LocalDateTime getLastLogin(Long usersId) {
        if (!usersRepository.existsById(usersId)) return null;
        Users user = usersRepository.findById(usersId).get();
        return user.getLastLogin();
    }

    @Override
    public UsersDto getUserByEmail(String email) {
        Users user = usersRepository.findByEmail(email);
        return usersMapper.toDto(user);
    }

    @Override
    public UsersDto changePassword(Long usersId, String newPassword) {
        return null;  // le problème de hachage
    }

    @Override
    public Page<UsersDto> getUsersPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Users> usersPage = usersRepository.findAll(pageable);
        return usersPage.map(usersMapper::toDto);
    }

    @Override
    public List<UsersDto> getActiveOrInActiveUsers(boolean active) {
        List<Users> users = usersRepository.findByActive(active);
        return users.stream()
                .map(user -> usersMapper.toDto(user))
                .collect(Collectors.toList());
    }

    @Override
    public long countUsersByRole(Role role) {
        return this.getUsersByRole(role).size();
    }

    @Override
    public long countTotalUsers() {
        return this.getAllUsers().size();
    }

    @Override
    public List<UsersDto> searchUsersByUsername(String username) {
        List<Users>  users = usersRepository.findByUsernameContaining(username);
        return users.stream()
                .map(user -> usersMapper.toDto(user))
                .collect(Collectors.toList());
    }

    @Override
    public void updateLastLogin(Long usersId) {
        if (!usersRepository.existsById(usersId)) return ;
        Users user = usersRepository.findById(usersId).get();
        user.setLastLogin(LocalDateTime.now());
        usersRepository.save(user);
    }

    @Override
    public long getDaysSinceLastLogin(Long usersId) {
        if (!usersRepository.existsById(usersId)) return 0;
        Users user = usersRepository.findById(usersId).get();
        LocalDateTime lastLogin = user.getLastLogin();

        return 0;
    }

    @Override
    public UsersDto resetPassword(String email) {
        return null; // le problème de hachage
    }

    @Override
    public UsersDto addRoleToUser(Long usersId, Role role) {
        if (!usersRepository.existsById(usersId)) return null;
        Users user = usersRepository.findById(usersId).get();
        user.setRole(role);
        Users savedUser = usersRepository.save(user);
        return usersMapper.toDto(savedUser);
    }


    @Override
    public UsersDto activateOrDeactivateUser(Long usersId, boolean activate) {
        if (!usersRepository.existsById(usersId)) return null;
        Users user = usersRepository.findById(usersId).get();
        if(activate) user.setActive(true);
        else user.setActive(false);
        Users savedUser = usersRepository.save(user);
        return usersMapper.toDto(savedUser);
    }

    @Override
    public void updateHoursLoggedIn(Long usersId) {
        LocalDateTime now =  LocalDateTime.now();
        Users user = usersRepository.findById(usersId).get();
        LocalDateTime lastLogin = user.getLastLogin();

        if (lastLogin != null) {
            long minutes = Duration.between(lastLogin, now).toMinutes();
            double hours = minutes / 60.0;


            user.setHoursLoggedIn(user.getHoursLoggedIn() + hours);
        }
        usersRepository.save(user);
    }
}
