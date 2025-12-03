package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.SearchHistoryDto;
import com.ensa.achrafkarim.backend.entities.SearchHistory;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.mapper.SearchHistoryMapper;
import com.ensa.achrafkarim.backend.mapper.UsersMapper;
import com.ensa.achrafkarim.backend.repository.SearchHistoryRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class SearchHistoryServiceImpl implements SearchHistoryService {

    private SearchHistoryRepository searchHistoryRepository;
    private SearchHistoryMapper searchHistoryMapper;
    private UsersService  usersService;
    private UsersMapper  usersMapper;

    @Override
    public SearchHistoryDto addSearchHistory(Long usersId, SearchHistoryDto searchHistoryDto) {
        SearchHistory searchHistory = searchHistoryMapper.toEntity(searchHistoryDto);
        searchHistory.setSearchedAt(LocalDateTime.now());
        Users user = usersMapper.toEntity(usersService.getUsers(usersId));
        searchHistory.setUser(user);
        SearchHistory savedSearchHistory = searchHistoryRepository.save(searchHistory);
        return searchHistoryMapper.toDto(savedSearchHistory);
    }

    @Override
    public void clearSearchHistory(Long usersId) {
        if (!searchHistoryRepository.findById(usersId).isPresent()) return;
        searchHistoryRepository.deleteAllByUserId(usersId);
    }

    @Override
    public void deleteSearchHistory(Long searchHistoryId) {
        if (!searchHistoryRepository.findById(searchHistoryId).isPresent()) return;
        searchHistoryRepository.deleteById(searchHistoryId);
    }

    @Override
    public Page<SearchHistoryDto> getSearchHistory(Long usersId, int page, int size) {
        Pageable  pageable = PageRequest.of(page, size);
        Page<SearchHistory> searchHistoryPage = searchHistoryRepository.findAll(pageable);
        return searchHistoryPage.map(searchHistoryMapper::toDto);
    }

    @Override
    public List<SearchHistoryDto> searchHistoryByQuery(Long usersId, String keyword) {
        List<SearchHistory> searchHistoryList = searchHistoryRepository.findByQueryContainingAndUserId(keyword, usersId);
        return searchHistoryList.stream()
                .map(search -> searchHistoryMapper.toDto(search))
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getTrendingSearches(Long usersId, int days, int limit) {
        return List.of();
    }

    @Override
    public Page<SearchHistoryDto> getRecentSearchHistory(Long usersId, int page, int size) {
        Pageable  pageable = PageRequest.of(page, size);
        Page<SearchHistory> searchHistoryList = searchHistoryRepository.findByUserIdOrderBySearchedAtDesc(usersId, pageable);
        return searchHistoryList.map(searchHistoryMapper::toDto);
    }
}
