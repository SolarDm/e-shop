package com.example.ecommerce.controller;

import com.example.ecommerce.model.Order;
import com.example.ecommerce.model.Product;
import com.example.ecommerce.model.User;
import com.example.ecommerce.service.OrderService;
import com.example.ecommerce.service.ProductService;
import com.example.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @PostMapping("/products")
    public ResponseEntity<?> createProductAdmin(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam BigDecimal price,
            @RequestParam Long categoryId) {
        try {
            Product product = productService.createProduct(name, description, price, categoryId);
            return ResponseEntity.ok(
                    Map.of("success", true, "product", product, "message", "Товар создан")
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Ошибка создания товара: " + e.getMessage()));
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProductAdmin(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam BigDecimal price,
            @RequestParam Long categoryId) {
        try {
            Product product = productService.getProductById(id);
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setCategory(productService.getCategoryById(categoryId));

            product = productService.updateProduct(id, name, description, price);
            return ResponseEntity.ok(
                    Map.of("success", true, "product", product, "message", "Товар обновлен")
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Ошибка обновления товара: " + e.getMessage()));
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProductAdmin(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(
                    Map.of("success", true, "message", "Товар удален")
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Ошибка удаления товара: " + e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        try {
            List<Order> orders = orderService.getAllOrders();

            if (status != null && !status.isEmpty()) {
                orders = orders.stream()
                        .filter(order -> status.equals(order.getStatus()))
                        .collect(Collectors.toList());
            }

            if (search != null && !search.isEmpty()) {
                String finalSearch = search.toLowerCase();
                orders = orders.stream()
                        .filter(order ->
                                String.valueOf(order.getId()).contains(finalSearch) ||
                                        (order.getRecipientName() != null &&
                                                order.getRecipientName().toLowerCase().contains(finalSearch)) ||
                                        (order.getRecipientPhone() != null &&
                                                order.getRecipientPhone().contains(finalSearch)) ||
                                        (order.getUser() != null &&
                                                order.getUser().getEmail().toLowerCase().contains(finalSearch))
                        )
                        .collect(Collectors.toList());
            }

            return ResponseEntity.ok(
                    Map.of("success", true, "orders", orders, "count", orders.size())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Ошибка загрузки заказов: " + e.getMessage()));
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Long id) {
        try {
            Order order = orderService.getOrderById(id);
            return ResponseEntity.ok(
                    Map.of("success", true, "order", order)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "Заказ не найден: " + e.getMessage()));
        }
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatusAdmin(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(
                    Map.of("success", true, "message", "Статус заказа обновлен")
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Ошибка обновления статуса: " + e.getMessage()));
        }
    }

    @PutMapping("/orders/{id}/delivery-info")
    public ResponseEntity<?> updateDeliveryInfoAdmin(
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
            if (deliveryInfo.containsKey("shippingCost")) {
                try {
                    order.setShippingCost(new BigDecimal(deliveryInfo.get("shippingCost")));
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Неверный формат стоимости доставки");
                }
            }

            orderService.updateOrderStatus(id, order.getStatus());

            return ResponseEntity.ok(
                    Map.of("success", true, "message", "Информация о доставке обновлена", "order", order)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Ошибка обновления информации: " + e.getMessage()));
        }
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok(
                    Map.of("success", true, "message", "Заказ удален")
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Ошибка удаления заказа: " + e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(
                    Map.of("success", true, "users", users)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Ошибка загрузки пользователей: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {
        try {
            User user = userService.updateUserRole(id, role);
            return ResponseEntity.ok(
                    Map.of("success", true, "message", "Роль пользователя обновлена", "user", user)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Ошибка обновления роли: " + e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            long totalUsers = userService.getTotalUsers();
            long totalOrders = orderService.getTotalOrders();
            long totalProducts = productService.getTotalProducts();

            Map<String, Object> dashboardStats = Map.of(
                    "totalUsers", totalUsers,
                    "totalOrders", totalOrders,
                    "totalProducts", totalProducts
            );

            return ResponseEntity.ok(
                    Map.of("success", true, "stats", dashboardStats)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Ошибка получения статистики: " + e.getMessage()));
        }
    }
}