package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.BasketItemDto;

import java.util.List;

public interface BasketService {

    List<BasketItemDto> getBasketItemsByUsersId(Long id);

}
