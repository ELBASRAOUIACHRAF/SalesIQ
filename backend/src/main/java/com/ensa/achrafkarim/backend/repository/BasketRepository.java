package com.ensa.achrafkarim.backend.repository;

import com.ensa.achrafkarim.backend.entities.Basket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BasketRepository extends JpaRepository<Basket, Long> {

    @Query("""
        SELECT b
        FROM Basket b
        JOIN FETCH b.items bi
        JOIN FETCH bi.product p
        WHERE b.user.id = :userId
    """)
    Basket findBasketByUserIdWithItems(Long userId);
}
