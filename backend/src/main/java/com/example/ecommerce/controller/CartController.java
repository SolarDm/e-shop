package com.example.ecommerce.controller;

import com.example.ecommerce.model.Cart;
import com.example.ecommerce.model.User;
import com.example.ecommerce.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<?> getCart(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Cart cart = cartService.getOrCreateCart(user);
            return ResponseEntity.ok(Map.of("success", true, "cart", cart));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Ошибка получения корзины: " + e.getMessage()));
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            Authentication authentication,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        try {
            User user = (User) authentication.getPrincipal();
            cartService.addToCart(user, productId, quantity);
            return ResponseEntity.ok(Map.of("success", true, "message", "Товар добавлен в корзину"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Ошибка добавления товара: " + e.getMessage()));
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFromCart(
            Authentication authentication,
            @RequestParam Long productId) {
        try {
            User user = (User) authentication.getPrincipal();
            cartService.removeFromCart(user, productId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Товар удален из корзины"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Ошибка удаления товара: " + e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(
            Authentication authentication,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        try {
            User user = (User) authentication.getPrincipal();
            cartService.updateCartItemQuantity(user, productId, quantity);
            return ResponseEntity.ok(Map.of("success", true, "message", "Количество товара обновлено"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Ошибка обновления товара: " + e.getMessage()));
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            cartService.clearCart(user);
            return ResponseEntity.ok(Map.of("success", true, "message", "Корзина очищена"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Ошибка очистки корзины: " + e.getMessage()));
        }
    }
}