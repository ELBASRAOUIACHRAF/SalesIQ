package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.BasketItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BasketItemRepository extends JpaRepository<BasketItem, Long> {
}
