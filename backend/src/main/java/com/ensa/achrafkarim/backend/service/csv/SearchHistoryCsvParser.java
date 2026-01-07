package com.ensa.achrafkarim.backend.service.csv;

import com.ensa.achrafkarim.backend.dto.csv.SearchHistoryCsvDto;
import com.ensa.achrafkarim.backend.entities.SearchHistory;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.repository.SearchHistoryRepository;
import com.ensa.achrafkarim.backend.repository.UsersRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class SearchHistoryCsvParser extends AbstractCsvParser<SearchHistoryCsvDto, SearchHistory> {

    private final SearchHistoryRepository searchHistoryRepository;
    private final UsersRepository usersRepository;

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    protected Class<SearchHistoryCsvDto> getDtoClass() {
        return SearchHistoryCsvDto.class;
    }

    @Override
    protected List<SearchHistoryCsvDto> getAllDtos() {
        return searchHistoryRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public SearchHistory toEntity(SearchHistoryCsvDto dto) {
        SearchHistory searchHistory = new SearchHistory();

        if (dto.getId() != null) {
            searchHistory.setId(dto.getId());
        }

        searchHistory.setQuery(dto.getQuery());

        if (dto.getSearchedAt() != null && !dto.getSearchedAt().isEmpty()) {
            searchHistory.setSearchedAt(LocalDateTime.parse(dto.getSearchedAt(), DATE_FORMAT));
        } else {
            searchHistory.setSearchedAt(LocalDateTime.now());
        }

        if (dto.getUserEmail() != null && !dto.getUserEmail().isEmpty()) {
            Users user = usersRepository.findByEmail(dto.getUserEmail());
            if (user == null) throw new RuntimeException("User not found: " + dto.getUserEmail());
            searchHistory.setUser(user);
        }

        return searchHistory;
    }

    @Override
    public SearchHistoryCsvDto toDto(SearchHistory entity) {
        SearchHistoryCsvDto dto = new SearchHistoryCsvDto();

        dto.setId(entity.getId());
        dto.setQuery(entity.getQuery());

        if (entity.getSearchedAt() != null) {
            dto.setSearchedAt(entity.getSearchedAt().format(DATE_FORMAT));
        }

        if (entity.getUser() != null) {
            dto.setUserEmail(entity.getUser().getEmail());
        }

        return dto;
    }

    @Override
    @Transactional
    public int importCsv(MultipartFile file) throws Exception {
        List<SearchHistoryCsvDto> dtos = parseCsv(file);

        List<SearchHistory> searchHistories = dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());

        searchHistoryRepository.saveAll(searchHistories);
        return searchHistories.size();
    }
}