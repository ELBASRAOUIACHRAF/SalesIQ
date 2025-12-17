package com.ensa.achrafkarim.backend.web;


import com.ensa.achrafkarim.backend.dto.BasketItemDto;
import com.ensa.achrafkarim.backend.service.BasketService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("basket")
@AllArgsConstructor
public class BasketRestController {

    private BasketService basketService;

    @GetMapping("/usersBasket/{userId}")
    public List<BasketItemDto> getBasketItemsByUserId(@PathVariable Long userId) {
        return basketService.getBasketItemsByUsersId(userId);
    }

}
