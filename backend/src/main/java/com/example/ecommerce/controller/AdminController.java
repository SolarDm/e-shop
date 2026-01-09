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
    public ResponseEntity<?> getAllOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(
                    Map.of("success", true, "orders", orders)
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

    @GetMapping("/orders/stats")
    public ResponseEntity<?> getOrderStatistics() {
        try {
            Map<String, Object> stats = orderService.getOrderStatistics();
            return ResponseEntity.ok(
                    Map.of("success", true, "stats", stats)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Ошибка получения статистики: " + e.getMessage()));
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