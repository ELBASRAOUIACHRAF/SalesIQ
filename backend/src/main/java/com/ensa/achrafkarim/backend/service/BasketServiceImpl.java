package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.BasketItemDto;
import com.ensa.achrafkarim.backend.entities.Basket;
import com.ensa.achrafkarim.backend.entities.Product;
import com.ensa.achrafkarim.backend.repository.BasketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class BasketServiceImpl implements BasketService {

    private final BasketRepository basketRepository;

    public BasketServiceImpl(BasketRepository basketRepository) {
        this.basketRepository = basketRepository;
    }

    @Override
    public List<BasketItemDto> getBasketItemsByUsersId(Long userId) {

        Basket basket = basketRepository.findBasketByUserIdWithItems(userId);

        if (basket == null || basket.getItems().isEmpty()) {
            return List.of();
        }

        return basket.getItems().stream()
                .map(item -> {
                    Product product = item.getProduct();
                    return new BasketItemDto(
                            item.getId(),
                            product.getName(),
                            product.getImageUrl(),
                            product.getDiscount(),
                            item.getQuantity(),
                            item.getUnitPrice(),
                            product.getStock()
                    );
                })
                .toList();
    }
}
