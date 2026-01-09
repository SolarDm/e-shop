package com.example.ecommerce.service;

import com.example.ecommerce.model.*;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Order> getUserOrders(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        return orderRepository.findByUser(user);
    }

    public Order createOrder(User user) {
        Cart cart = cartRepository.findByUser(user);
        if (cart == null || cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Корзина пуста");
        }

        Order order = new Order(user);

        Set<OrderItem> orderItems = cart.getCartItems().stream()
                .map(item -> new OrderItem(order, item.getProduct(), item.getQuantity()))
                .collect(Collectors.toSet());

        order.setOrderItems(orderItems);
        orderRepository.save(order);

        cart.getCartItems().clear();
        cartRepository.save(cart);

        return order;
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заказ не найден"));
    }

    public void updateOrderStatus(Long orderId, String status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        orderRepository.save(order);
    }

    public Order reorder(Long orderId, Long userId) {
        Order oldOrder = getOrderById(orderId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Cart cart = cartRepository.findByUser(user);
        if (cart == null) {
            cart = new Cart(user);
            cart = cartRepository.save(cart);
        }

        for (OrderItem orderItem : oldOrder.getOrderItems()) {
            Product product = orderItem.getProduct();
            Integer quantity = orderItem.getQuantity();

            CartItem existingCartItem = cart.getCartItems().stream()
                    .filter(item -> item.getProduct().getId().equals(product.getId()))
                    .findFirst()
                    .orElse(null);

            if (existingCartItem != null) {
                existingCartItem.setQuantity(existingCartItem.getQuantity() + quantity);
            } else {
                CartItem cartItem = new CartItem(cart, product, quantity);
                cart.getCartItems().add(cartItem);
            }
        }

        cartRepository.save(cart);

        Order newOrder = new Order(user);

        Set<OrderItem> newOrderItems = oldOrder.getOrderItems().stream()
                .map(oldItem -> new OrderItem(newOrder, oldItem.getProduct(), oldItem.getQuantity()))
                .collect(Collectors.toSet());

        newOrder.setOrderItems(newOrderItems);

        return orderRepository.save(newOrder);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public long getTotalOrders() {
        return orderRepository.count();
    }

    public Map<String, Object> getOrderStatistics() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus("PENDING");
        long completedOrders = orderRepository.countByStatus("COMPLETED");
        long cancelledOrders = orderRepository.countByStatus("CANCELLED");

        return Map.of(
                "totalOrders", totalOrders,
                "pendingOrders", pendingOrders,
                "completedOrders", completedOrders,
                "cancelledOrders", cancelledOrders
        );
    }

}
