package com.example.ecommerce.service;

import com.example.ecommerce.model.User;
import com.example.ecommerce.model.Role;
import com.example.ecommerce.model.ERole;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(String username, String email, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Имя пользователя уже занято!");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email уже используется!");
        }

        User user = new User(username, email, passwordEncoder.encode(password));

        Set<Role> roles = new HashSet<>();

        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Роль не найдена"));
        roles.add(userRole);
        user.setRoles(roles);

        return userRepository.save(user);
    }
}
