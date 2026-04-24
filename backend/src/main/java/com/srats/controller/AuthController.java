package com.srats.controller;

import com.srats.dto.AuthDto;
import com.srats.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(@Valid @RequestBody AuthDto.RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthDto.AuthResponse> googleLogin(@Valid @RequestBody AuthDto.GoogleLoginRequest req) {
        return ResponseEntity.ok(authService.googleLogin(req));
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, String>> check() {
        return ResponseEntity.ok(Map.of("status", "SRATS backend running ✓"));
    }
}
