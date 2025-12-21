package com.ensa.achrafkarim.backend.web;


import com.ensa.achrafkarim.backend.dto.SearchHistoryDto;
import com.ensa.achrafkarim.backend.entities.SearchHistory;
import com.ensa.achrafkarim.backend.service.SearchHistoryService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("search")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@AllArgsConstructor
public class SearchHistoryRestController {
    private SearchHistoryService searchHistoryService;


    @GetMapping("/allHistory/{usersId}")
    public Page<SearchHistoryDto> getSearchHistory(@PathVariable Long usersId, @RequestParam int page, @RequestParam int size) {
        return searchHistoryService.getSearchHistory(usersId, page, size);
    }

    @GetMapping("/getRecentSearches/{usersId}")
    public Page<SearchHistoryDto> getRecentSearches(@PathVariable Long usersId, @RequestParam int page, @RequestParam int size) {
        return searchHistoryService.getRecentSearchHistory(usersId, page, size);
    }

    @PostMapping("/addSearch/{usersId}")
    public SearchHistoryDto addSearchHistory(@PathVariable Long usersId, @RequestBody SearchHistoryDto searchHistoryDto) {
        return searchHistoryService.addSearchHistory(usersId, searchHistoryDto);
    }

    @DeleteMapping("/clearHistory")
    public void clearSearchHistory(@RequestParam Long usersId) {
        searchHistoryService.clearSearchHistory(usersId);
    }

    @DeleteMapping("/deleteSearch/{searchHistoryId}")
    public void deleteSearch(@PathVariable Long searchHistoryId) {
        searchHistoryService.deleteSearchHistory(searchHistoryId);
    }


    @GetMapping("/searchQuery/{usersId}")
    public List<SearchHistoryDto> searchQuery(@PathVariable Long usersId, @RequestParam String query) {
        return searchHistoryService.searchHistoryByQuery(usersId, query);
    }


}








