package com.srats.controller;

import com.srats.entity.User;
import com.srats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Shared base for all controllers that receive a JWT-based principal.
 *
 * The JWT filter puts a Long userId into the SecurityContext, NOT a User object.
 * @AuthenticationPrincipal therefore gives us an Object (the Long).
 * getUser() safely converts it to a fully-loaded User entity.
 */
public abstract class BaseController {

    @Autowired
    protected UserRepository userRepository;

    protected User getUser(Object principal) {
        Long userId = principal instanceof Long
                ? (Long) principal
                : Long.parseLong(principal.toString());
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }
}
