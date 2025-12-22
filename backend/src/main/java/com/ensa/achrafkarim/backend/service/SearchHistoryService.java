package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.SearchHistoryDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface SearchHistoryService {

    SearchHistoryDto addSearchHistory(Long usersId, String query);
    void clearSearchHistory(Long usersId);
    void deleteSearchHistory(Long searchHistoryId);
    Page<SearchHistoryDto> getSearchHistory(Long usersId, int page, int size);

    Long getCountSearchHistory(Long usersId);

    List<SearchHistoryDto> searchHistoryByQuery(Long usersId, String keyword);
    List<String> getTrendingSearches(Long usersId, int days, int limit);
    Page<SearchHistoryDto> getRecentSearchHistory(Long usersId, int page, int size);
}
