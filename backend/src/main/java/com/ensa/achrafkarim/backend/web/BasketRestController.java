package com.ensa.achrafkarim.backend.web;


import com.ensa.achrafkarim.backend.dto.BasketItemDto;
import com.ensa.achrafkarim.backend.dto.UsersDto;
import com.ensa.achrafkarim.backend.entities.BasketItem;
import com.ensa.achrafkarim.backend.service.BasketService;
import com.ensa.achrafkarim.backend.service.UsersService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/basket")
//@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@AllArgsConstructor
public class BasketRestController {

    private final BasketService basketService;
    private final UsersService usersService;

    @GetMapping("/usersBasket")
    public ResponseEntity<List<BasketItemDto>> usersBasket(Principal principal) {
        if (principal == null) {
            System.out.println("principal add basket null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UsersDto user = usersService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(basketService.getBasketItemsByUsersId(user.getId()));
    }

    @PostMapping("/add")
    public ResponseEntity<Boolean> addToBasket(
            @RequestParam Long quantity,
            @RequestParam Long productId,
            Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
        }
        UsersDto user = usersService.getUserByEmail(principal.getName());
        boolean result = basketService.addToBasket(productId, user.getId(), quantity);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/itemscount")
    public ResponseEntity<Long> getBasketItemsCount(Principal principal) {
        if (principal == null) {
            return ResponseEntity.ok(0L);
        }

        UsersDto user = usersService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(basketService.getBasketItemsCount(user.getId()));
    }

    @DeleteMapping("/deleteBasketItem")
    public ResponseEntity<Void> deleteFromBasket(@RequestParam Long basketItemId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UsersDto user = usersService.getUserByEmail(principal.getName());

        basketService.deleteItem(basketItemId, user.getId());
        return ResponseEntity.ok().build();
    }
}
