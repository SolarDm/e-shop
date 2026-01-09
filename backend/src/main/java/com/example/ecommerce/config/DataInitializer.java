package com.example.ecommerce.config;

import com.example.ecommerce.model.*;
import com.example.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class DataInitializer {
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Bean
    public CommandLineRunner initializeData() {
        return args -> {
            Role roleUser = roleRepository.findByName(ERole.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_USER)));
                
            Role roleAdmin = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_ADMIN)));


            if (userRepository.findByUsername("demo").isEmpty()) {
                User demoUser = new User();
                demoUser.setUsername("demo");
                demoUser.setEmail("demo@example.com");
                demoUser.setPassword(passwordEncoder.encode("Demo123!"));
                
                Set<Role> demoRoles = new HashSet<>();
                demoRoles.add(roleUser);
                demoUser.setRoles(demoRoles);
                
                userRepository.save(demoUser);
            }

            if (categoryRepository.count() == 0) {
                Category cat1 = categoryRepository.save(new Category("Электроника"));
                Category cat2 = categoryRepository.save(new Category("Одежда"));
                Category cat3 = categoryRepository.save(new Category("Книги"));
                Category cat4 = categoryRepository.save(new Category("Спорт"));
                Category cat5 = categoryRepository.save(new Category("Животные"));
    
                productRepository.save(new Product("Смартфон", "Современный смартфон с отличной камерой", new BigDecimal(29990.0), cat1));
                productRepository.save(new Product("Ноутбук", "Мощный ноутбук для работы и игр", new BigDecimal(59990.0), cat1));
                productRepository.save(new Product("Футболка", "Качественная хлопковая футболка", new BigDecimal(990.0), cat2));
                productRepository.save(new Product("Джинсы", "Стильные джинсы для повседневной носки", new BigDecimal(2490.0), cat2));
                productRepository.save(new Product("Книга", "Интересная книга по программированию", new BigDecimal(790.0), cat3));
                productRepository.save(new Product("Велосипед", "Горный велосипед для активного отдыха", new BigDecimal(12990.0), cat4));
                productRepository.save(new Product("Слон", "Купи слона", new BigDecimal(10000000.0), cat5));
            }

            if (userRepository.findByUsername("admin").isEmpty()) {
                User adminUser = new User();
                adminUser.setUsername("admin");
                adminUser.setEmail("admin@example.com");
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                
                Set<Role> adminRoles = new HashSet<>();
                adminRoles.add(roleAdmin);
                adminRoles.add(roleUser);
                adminUser.setRoles(adminRoles);
                
                userRepository.save(adminUser);
            }
        };
    }
}