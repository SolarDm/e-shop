package com.example.ecommerce.controller;

import com.example.ecommerce.model.Order;
import com.example.ecommerce.model.User;
import com.example.ecommerce.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<?> getUserOrders(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<Order> orders = orderService.getUserOrders(user.getId());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "orders", orders
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "error", "Ошибка получения заказов: " + e.getMessage()
                    ));
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody Map<String, String> deliveryInfo,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Order order;

            order = orderService.createOrder(user, deliveryInfo);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Заказ успешно оформлен",
                    "order", order
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "error", "Ошибка оформления заказа: " + e.getMessage()
                    ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            Order order = orderService.getOrderById(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "order", order
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "error", "Заказ не найден: " + e.getMessage()
                    ));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Статус заказа обновлен"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "error", "Ошибка обновления статуса: " + e.getMessage()
                    ));
        }
    }

    @PostMapping("/{id}/reorder")
    public ResponseEntity<?> reorder(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Order newOrder = orderService.reorder(id, user.getId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Заказ добавлен в корзину",
                    "order", newOrder
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "error", "Ошибка повторного заказа: " + e.getMessage()
                    ));
        }
    }

    @PutMapping("/{id}/delivery-info")
    public ResponseEntity<?> updateDeliveryInfo(
            @PathVariable Long id,
            @RequestBody Map<String, String> deliveryInfo) {
        try {
            Order order = orderService.getOrderById(id);

            if (deliveryInfo.containsKey("shippingAddress")) {
                order.setShippingAddress(deliveryInfo.get("shippingAddress"));
            }
            if (deliveryInfo.containsKey("recipientPhone")) {
                order.setRecipientPhone(deliveryInfo.get("recipientPhone"));
            }
            if (deliveryInfo.containsKey("recipientName")) {
                order.setRecipientName(deliveryInfo.get("recipientName"));
            }
            if (deliveryInfo.containsKey("deliveryNotes")) {
                order.setDeliveryNotes(deliveryInfo.get("deliveryNotes"));
            }
            if (deliveryInfo.containsKey("shippingMethod")) {
                order.setShippingMethod(deliveryInfo.get("shippingMethod"));
            }

            orderService.updateOrderStatus(id, order.getStatus());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Информация о доставке обновлена"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "error", "Ошибка обновления информации: " + e.getMessage()
                    ));
        }
    }
}