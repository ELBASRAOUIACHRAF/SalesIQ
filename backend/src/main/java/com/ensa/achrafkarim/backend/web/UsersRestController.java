package com.ensa.achrafkarim.backend.web;


import com.ensa.achrafkarim.backend.dto.ProfileDto;
import com.ensa.achrafkarim.backend.dto.RegistrationDto;
import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.enums.Role;
import com.ensa.achrafkarim.backend.service.UsersService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/users")
//@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@AllArgsConstructor
public class UsersRestController {

    private final UsersService usersService;

    @PutMapping("/profileUpdate")
    public ResponseEntity<ProfileDto> updateUserData(@RequestBody ProfileDto profileDto, Principal principal){

        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        UsersDto currentUser = usersService.getUserByEmail(principal.getName());

        profileDto.setId(currentUser.getId());
        return ResponseEntity.ok(usersService.updateUsersInfo(profileDto));
    }


    @GetMapping("/profile")
    public ResponseEntity<ProfileDto>  getProfile(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        UsersDto user = usersService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(usersService.getUsersProfile(user.getId()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/addUser")
    public UsersDto addUser(@RequestBody UsersDto usersDto) {
        return usersService.addUsers(usersDto);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/updateUser")
    public ResponseEntity<UsersDto> updateUserAsAdmin(@RequestBody UsersDto usersDto) {
        return ResponseEntity.ok(usersService.updateUsers(usersDto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/deleteUser/{userId}")
    public void deleteUser(@PathVariable Long userId) {
        usersService.deleteUsers(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getUsersList")
    public List<UsersDto> getUsersList() {
        return usersService.getAllUsers();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getOneUser/{userId}")
    public UsersDto getOneUser(@PathVariable Long userId) {
        return usersService.getUsers(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/userLastLoging/{userId}")
    public LocalDateTime getUserLastLoging(@PathVariable Long userId) {
        return usersService.getLastLogin(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/userByEmail")
    public UsersDto getUserByEmail(@RequestParam String email) {
        return usersService.getUserByEmail(email);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getUsersPage")
    public Page<UsersDto>  getUsersPage(@RequestParam int page, @RequestParam int size) {
        return usersService.getUsersPage(page, size);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getUsersByStatus")
    public List<UsersDto> getUsersByStatus(@RequestParam boolean status) {
        return usersService.getActiveOrInActiveUsers(status);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/countUsersByRole")
    public long countUsersByRole(@RequestParam Role role) {
        return usersService.countUsersByRole(role);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/countUsers")
    public long countUsers() {
        return usersService.countTotalUsers();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/searchByUsername")
    public List<UsersDto> searchByUsername(@RequestParam String username) {
        return usersService.searchUsersByUsername(username);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/addRoleToUser/{userId}")
    public UsersDto addRoleToUser(@PathVariable Long userId, @RequestBody Role role) {
        return usersService.addRoleToUser(userId, role);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/userChangeStatus/{userId}")
    public UsersDto userChangeStatus(@PathVariable Long userId, @RequestParam boolean status) {
        return usersService.activateOrDeactivateUser(userId, status);
    }


}
