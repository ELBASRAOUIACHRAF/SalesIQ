package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.BasketItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BasketItemRepository extends JpaRepository<BasketItem, Long> {

    Optional<BasketItem> findByBasketIdAndProductId(Long basketId, Long productId);
}
