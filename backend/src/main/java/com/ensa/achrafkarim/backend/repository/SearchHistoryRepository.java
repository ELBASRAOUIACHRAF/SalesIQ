package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.SearchHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {

    void deleteAllByUserId(Long usersId);

    @Modifying
    @Query("DELETE FROM SearchHistory sh WHERE sh.id = :id AND sh.user.id = :userId")
    void deleteByIdAndUsersId(Long id, Long usersId);

    List<SearchHistory> findByQueryContainingAndUserId(String keyword,  Long userId);

    Page<SearchHistory> findByUserIdOrderBySearchedAtDesc(Long usersId, Pageable pageable);
    Long countByUserId(Long userId);

    Page<SearchHistory> findAllByUserId(Long usersId, Pageable pageable);
}
