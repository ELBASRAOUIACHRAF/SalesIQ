package com.ensa.achrafkarim.backend.mapper;

import com.ensa.achrafkarim.backend.dto.SearchHistoryDto;
import com.ensa.achrafkarim.backend.entities.SearchHistory;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SearchHistoryMapper {
    SearchHistory toEntity(SearchHistoryDto  searchHistoryDto);
    SearchHistoryDto toDto(SearchHistory searchHistory);
}
