package com.srats.service;

import com.srats.dto.AuthDto;
import com.srats.entity.User;
import com.srats.repository.UserRepository;
import com.srats.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Collections;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    @Value("${google.client.id:}")
    private String googleClientId;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(req.getRoleEnum())
                .department(req.getDepartment())
                .rollNo(req.getRollNo())
                .year(req.getYear())
                .employeeId(req.getEmployeeId())
                .designation(req.getDesignation())
                .subject(req.getSubject())
                .phone(req.getPhone())
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getId(), saved.getRole());
        return AuthDto.AuthResponse.from(saved, token);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        return AuthDto.AuthResponse.from(user, token);
    }

    public AuthDto.AuthResponse googleLogin(AuthDto.GoogleLoginRequest req) {
        try {
            if (googleClientId == null || googleClientId.isEmpty()) {
                throw new RuntimeException("Google Client ID not configured in backend");
            }

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(req.getIdToken());
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // Check if user exists
                User user = userRepository.findByEmail(email).orElseGet(() -> {
                    // Create basic Student user if not found
                    User newUser = User.builder()
                            .name(name)
                            .email(email)
                            .password(passwordEncoder.encode("GOOGLE_AUTH_" + System.currentTimeMillis()))
                            .role(User.Role.STUDENT)
                            .active(true)
                            .build();
                    return userRepository.save(newUser);
                });

                String token = jwtUtil.generateToken(user.getId(), user.getRole());
                return AuthDto.AuthResponse.from(user, token);
            } else {
                throw new RuntimeException("Invalid Google ID Token");
            }
        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }
}
