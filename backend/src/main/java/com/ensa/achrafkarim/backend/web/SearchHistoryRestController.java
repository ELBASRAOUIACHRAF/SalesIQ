package com.ensa.achrafkarim.backend.web;


import com.ensa.achrafkarim.backend.dto.SearchHistoryDto;
import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.entities.SearchHistory;
import com.ensa.achrafkarim.backend.service.SearchHistoryService;
import com.ensa.achrafkarim.backend.service.UsersService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/search")
//@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@AllArgsConstructor
public class SearchHistoryRestController {
    private final SearchHistoryService searchHistoryService;
    private final UsersService usersService;


    @GetMapping("/allHistory")
    public Page<SearchHistoryDto> getSearchHistory(Principal principal, @RequestParam int page, @RequestParam int size) {
        if (principal == null) {
            return Page.empty();
        }
        UsersDto userDto = usersService.getUserByEmail(principal.getName());
        return searchHistoryService.getSearchHistory(userDto.getId(), page, size);
    }

    @GetMapping("/getRecentSearches")
    public Page<SearchHistoryDto> getRecentSearches(Principal principal, @RequestParam int page, @RequestParam int size) {

        if (principal == null) {
            return Page.empty();
        }
        UsersDto userDto = usersService.getUserByEmail(principal.getName());
        return searchHistoryService.getRecentSearchHistory(userDto.getId(), page, size);
    }

    @PostMapping("/addSearch")
    public ResponseEntity<SearchHistoryDto> addSearchHistory(Principal principal, @RequestBody String query) {
        if (principal == null) {
            return ResponseEntity.ok(null);
        }
        UsersDto userDto = usersService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(searchHistoryService.addSearchHistory(userDto.getId(), query));
    }

    @DeleteMapping("/clearHistory")
    public void clearSearchHistory(Principal principal) {
        if (principal != null) {
            UsersDto user = usersService.getUserByEmail(principal.getName());
            searchHistoryService.clearSearchHistory(user.getId());
        }
    }

    @DeleteMapping("/deleteSearch/{searchHistoryId}")
    public ResponseEntity<Void> deleteSearch(@PathVariable Long searchHistoryId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build(); // Non autorisé
        }
        UsersDto user = usersService.getUserByEmail(principal.getName());

        searchHistoryService.deleteSearchHistory(searchHistoryId, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/searchQuery")
    public List<SearchHistoryDto> searchQuery(Principal principal, @RequestParam String query) {
        if (principal == null) {
            return List.of();
        }
        return searchHistoryService.searchHistoryByQuery(usersService.getUserByEmail(principal.getName()).getId(), query);
    }


}