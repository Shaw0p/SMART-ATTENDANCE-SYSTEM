package com.srats.security;

import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Log every request for debugging
        System.out.println(">>> REQUEST: " + method + " " + path);

        // Skip auth for public endpoints
        if (path.startsWith("/api/auth/") || path.startsWith("/actuator/") || path.equals("/api/health")) {
            System.out.println(">>> SKIPPING auth for public path: " + path);
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        System.out.println(">>> Authorization header: " + (header != null ? header.substring(0, Math.min(30, header.length())) + "..." : "NULL"));

        if (header == null || !header.startsWith("Bearer ")) {
            System.out.println(">>> NO Bearer token — rejecting");
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            if (!jwtUtil.isValid(token)) {
                System.out.println(">>> JWT invalid or expired");
                chain.doFilter(request, response);
                return;
            }

            Long userId = jwtUtil.extractUserId(token);
            String role = jwtUtil.extractRole(token);

            System.out.println(">>> JWT valid — userId=" + userId + " role=" + role);

            // Add ROLE_ prefix for Spring Security
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userId, null, Collections.singletonList(authority));

            // THIS IS CRITICAL — must set in SecurityContextHolder
            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println(">>> Authentication SET — authorities: " + authentication.getAuthorities());

        } catch (Exception e) {
            System.err.println(">>> JWT processing error: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
    }
}
