package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.BasketItemDto;
import com.ensa.achrafkarim.backend.entities.Basket;

import java.util.List;

public interface BasketService {

    List<BasketItemDto> getBasketItemsByUsersId(Long id);

    boolean addToBasket(Long productId, Long basketId, Long quantity);

}
