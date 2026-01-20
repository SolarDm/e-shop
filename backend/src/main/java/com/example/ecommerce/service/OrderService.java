package com.example.ecommerce.service;

import com.example.ecommerce.model.*;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
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

    public Order createOrder(User user, Map<String, String> deliveryInfo) {
        Cart cart = cartRepository.findByUser(user);
        if (cart == null || cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Корзина пуста");
        }

        Order order = new Order(user);

        if (deliveryInfo != null) {
            order.setShippingAddress(deliveryInfo.get("shippingAddress"));
            order.setRecipientPhone(deliveryInfo.get("recipientPhone"));
            order.setRecipientName(deliveryInfo.get("recipientName"));
            order.setDeliveryNotes(deliveryInfo.get("deliveryNotes"));
            order.setShippingMethod(deliveryInfo.get("shippingMethod"));

            String method = deliveryInfo.get("shippingMethod");
            if ("EXPRESS".equals(method)) {
                order.setShippingCost(new BigDecimal("500.00"));
            } else if ("STANDARD".equals(method)) {
                order.setShippingCost(new BigDecimal("250.00"));
            } else if ("PICKUP".equals(method)) {
                order.setShippingCost(BigDecimal.ZERO);
            }
        }

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

        Order newOrder = new Order(user);
        newOrder.setShippingAddress(oldOrder.getShippingAddress());
        newOrder.setRecipientPhone(oldOrder.getRecipientPhone());
        newOrder.setRecipientName(oldOrder.getRecipientName());
        newOrder.setShippingMethod(oldOrder.getShippingMethod());
        newOrder.setShippingCost(oldOrder.getShippingCost());

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

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = getOrderById(orderId);

        order.getOrderItems().clear();
        orderRepository.save(order);

        orderRepository.delete(order);
    }

    public List<Order> getOrdersBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findAll()
                .stream()
                .filter(order -> order.getOrderDate() != null &&
                        !order.getOrderDate().isBefore(startDate) &&
                        !order.getOrderDate().isAfter(endDate))
                .sorted(Comparator.comparing(Order::getOrderDate).reversed())
                .collect(Collectors.toList());
    }

}
