package com.ensa.achrafkarim.backend.web;


import com.ensa.achrafkarim.backend.dto.BasketItemDto;
import com.ensa.achrafkarim.backend.entities.BasketItem;
import com.ensa.achrafkarim.backend.service.BasketService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("basket")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class BasketRestController {

    private BasketService basketService;

    @GetMapping("/usersBasket/{userId}")
    public List<BasketItemDto> getBasketItemsByUserId(@PathVariable Long userId) {
        return basketService.getBasketItemsByUsersId(userId);
    }

    @PostMapping("/add")
    public boolean addToBasket(
            @RequestParam Long quantity,
            @RequestParam Long productId,
            @RequestParam Long basketId) {
        return basketService.addToBasket(productId, basketId, quantity);
    }

}
