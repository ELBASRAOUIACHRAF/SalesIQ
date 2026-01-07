package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.BasketItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BasketItemRepository extends JpaRepository<BasketItem, Long> {

    Optional<BasketItem> findByBasketIdAndProductId(Long basketId, Long productId);

    Long countByBasketId(Long basketId);

    @Modifying // OBLIGATOIRE pour un DELETE
    @Query("DELETE FROM BasketItem bi WHERE bi.id = :itemId AND bi.basket.user.id = :userId")
    void deleteByIdAndBasketUserId(@Param("itemId") Long itemId, @Param("userId") Long userId);
}
