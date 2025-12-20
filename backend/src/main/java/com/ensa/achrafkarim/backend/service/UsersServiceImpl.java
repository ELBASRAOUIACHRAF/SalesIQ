package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.ProfileDto;
import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.Role;
import com.ensa.achrafkarim.backend.enums.Segment;
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

    // private PasswordEncoder passwordEncoder;
    UsersRepository  usersRepository;
    UsersMapper  usersMapper;


    @Override
    public void updateUsersSegment(Long usersId, Segment segment) {
        Users users = usersRepository.findById(usersId).get();
        users.setSegment(segment);
        usersRepository.save(users);
    }

    @Override
    public UsersDto addUsers(UsersDto usersDto) {
        Users user =  usersMapper.toEntity(usersDto);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setHoursLoggedIn(0);
        user.setLastLogin(LocalDateTime.now());
        user.setActive(true);
        user.setPassword("null"); // a changer

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
        Users user = usersRepository.findById(usersId).orElse(null);
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
    public UsersDto activateOrDeactivateUser(Long userId, boolean activate) {
        Users user = usersRepository.findById(userId).orElse(null);
        if(user == null) return null;
        user.setActive(activate);
        user.setUpdatedAt(LocalDateTime.now());
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

    @Override
    public boolean existsByEmail(String email) {
        return usersRepository.existsByEmail(email);
    }

    @Override
    public ProfileDto getUsersProfile(Long usersId) {
        return usersRepository.findById(usersId)
                .map(user -> {
                    ProfileDto dto = new ProfileDto();

                    // --- Header & Personal Info ---
                    dto.setId(user.getId());
                    dto.setFirstName(user.getFirstName());
                    dto.setLastName(user.getLastName());
                    dto.setUsername(user.getUsername());
                    dto.setEmail(user.getEmail());
                    dto.setPhoneNumber(user.getPhoneNumber());
                    dto.setRole(user.getRole());
                    dto.setBio(user.getBio());

                    // --- Account Activity ---
                    dto.setHoursLoggedIn(user.getHoursLoggedIn());
                    dto.setLastLogin(user.getLastLogin());
                    dto.setCreatedAt(user.getCreatedAt());
                    dto.setUpdatedAt(user.getUpdatedAt());

                    // --- Address Section ---
                    dto.setCountry(user.getCountry());
                    dto.setCity(user.getCity());
                    dto.setPostalCode(user.getPostalCode());

                    return dto;
                })
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID : " + usersId));
    }

    @Override
    public ProfileDto updateUsersInfo(ProfileDto profileDto) {
        Users user = usersRepository.findById(profileDto.getId()).orElse(null);
        user.setFirstName(profileDto.getFirstName());
        user.setLastName(profileDto.getLastName());
        user.setUsername(profileDto.getUsername());
        user.setEmail(profileDto.getEmail());
        user.setUpdatedAt(LocalDateTime.now());
        user.setBio(profileDto.getBio());
        user.setPhoneNumber(profileDto.getPhoneNumber());
        user.setCity(profileDto.getCity());
        user.setCountry(profileDto.getCountry());
        usersRepository.save(user);
        return profileDto;
    }
}
