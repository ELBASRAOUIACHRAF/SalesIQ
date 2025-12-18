package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.BasketItemDto;
import com.ensa.achrafkarim.backend.entities.Basket;
import com.ensa.achrafkarim.backend.entities.BasketItem;
import com.ensa.achrafkarim.backend.entities.Product;
import com.ensa.achrafkarim.backend.mapper.ProductMapper;
import com.ensa.achrafkarim.backend.repository.BasketItemRepository;
import com.ensa.achrafkarim.backend.repository.BasketRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@AllArgsConstructor
public class BasketServiceImpl implements BasketService {

    private final BasketRepository basketRepository;
    private BasketItemRepository basketItemRepository;
    private ProductService productService;
    private ProductMapper productMapper;

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

    @Override
    public boolean addToBasket(Long productId, Long basketId, Long quantity) {

        if (quantity == null || quantity <= 0) {
            quantity = 1L;
        }

        Basket basket = basketRepository.findById(basketId).orElseThrow(() -> new RuntimeException("Basket not found"));

        Product product = productMapper.toEntity(productService.getProduct(productId));

        Optional<BasketItem> existingItemOpt =
                basketItemRepository.findByBasketIdAndProductId(basketId, productId);

        if (existingItemOpt.isPresent()) {

            BasketItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            basketItemRepository.save(existingItem);
        } else {
            BasketItem basketItem = new BasketItem();
            basketItem.setBasket(basket);
            basketItem.setProduct(product);
            basketItem.setQuantity(quantity);
            basketItem.setUnitPrice(product.getPrice());

            basketItemRepository.save(basketItem);
        }
        return true;
    }


}
