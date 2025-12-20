package com.ensa.achrafkarim.backend.web;


import com.ensa.achrafkarim.backend.dto.ProfileDto;
import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.enums.Role;
import com.ensa.achrafkarim.backend.service.UsersService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController("/users")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class UsersRestController {

    UsersService usersService;

    @PutMapping("/profileUpdate")
    public ProfileDto updateUserData(@RequestBody ProfileDto profileDto){
        return usersService.updateUsersInfo(profileDto);
    }


    @GetMapping("/profile/{usersId}")
    public ProfileDto getProfile(@PathVariable Long usersId) {
        return usersService.getUsersProfile(usersId);
    }

    @PostMapping("/addUser")
    public UsersDto addUser(@RequestBody UsersDto usersDto) {
        return usersService.addUsers(usersDto);
    }

    @PutMapping("/updateUser")
    public  UsersDto updateUser(@RequestBody UsersDto usersDto) {
        return usersService.updateUsers(usersDto);
    }

    @DeleteMapping("/deleteUser/{userId}")
    public void deleteUser(@PathVariable Long userId) {
        usersService.deleteUsers(userId);
    }

    @GetMapping("/getUsersList")
    public List<UsersDto> getUsersList() {
        return usersService.getAllUsers();
    }

    @GetMapping("/getOneUser/{userId}")
    public UsersDto getOneUser(@PathVariable Long userId) {
        return usersService.getUsers(userId);
    }

    @GetMapping("/userLastLoging/{userId}")
    public LocalDateTime getUserLastLoging(@PathVariable Long userId) {
        return usersService.getLastLogin(userId);
    }

    @GetMapping("/userByEmail")
    public UsersDto getUserByEmail(@RequestParam String email) {
        return usersService.getUserByEmail(email);
    }

    @GetMapping("/getUsersPage")
    public Page<UsersDto>  getUsersPage(@RequestParam int page, @RequestParam int size) {
        return usersService.getUsersPage(page, size);
    }

    @GetMapping("/getUsersByStatus")
    public List<UsersDto> getUsersByStatus(@RequestParam boolean status) {
        return usersService.getActiveOrInActiveUsers(status);
    }

    @GetMapping("/countUsersByRole")
    public long countUsersByRole(Role role) {
        return usersService.countUsersByRole(role);
    }

    @GetMapping("/countUsers")
    public long countUsers() {
        return usersService.countTotalUsers();
    }

    @GetMapping("/searchByUsername")
    public List<UsersDto> searchByUsername(@RequestParam String username) {
        return usersService.searchUsersByUsername(username);
    }

    @PutMapping("/updateLastLoging/{userId}")
    public void updateLastLoging(@PathVariable Long userId) {
        usersService.updateLastLogin(userId);
    }

    @PutMapping("/addRoleToUser/{userId}")
    public UsersDto addRoleToUser(@PathVariable Long userId, @RequestBody Role role) {
        return usersService.addRoleToUser(userId, role);
    }

    @PutMapping("/userChangeStatus/{userId}")
    public UsersDto userChangeStatus(@PathVariable Long userId, @RequestParam boolean status) {
        return usersService.activateOrDeactivateUser(userId, status);
    }

    @PutMapping("/updateHoursLoggedIn/{userId}")
    public void updateHoursLoggedIn(@PathVariable Long userId) {
        usersService.updateHoursLoggedIn(userId);
    }

    @GetMapping("/daySinceLastLogIn/{userId}")
    public long getDaysSinceLastLogIn(@PathVariable Long userId) {
        return usersService.getDaysSinceLastLogin(userId);
    }



}
