package com.srats.dto;

import com.srats.entity.User;
import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank private String name;
        @NotBlank @Email private String email;
        @NotBlank private String password;
        
        // Accept as String so frontend can send "STUDENT" or "TEACHER" as plain text
        private String role;
        
        private String department;
        // Student fields
        private String rollNo;
        private Integer year;
        // Teacher fields
        private String employeeId;
        private String designation;
        private String subject;
        private String phone;
        
        // Helper to convert string role to enum safely
        public User.Role getRoleEnum() {
            try {
                return User.Role.valueOf(this.role.toUpperCase().trim());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid role: " + this.role + ". Must be STUDENT, TEACHER, or ADMIN.");
            }
        }
    }

    @Data
    public static class LoginRequest {
        @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data
    public static class GoogleLoginRequest {
        @NotBlank private String idToken;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private Long userId;
        private String name;
        private String email;
        private String role; // Send as String not enum so JSON is clean "TEACHER" not {"name":"TEACHER"}
        private String department;
        private String rollNo;
        private String employeeId;

        public static AuthResponse from(User user, String token) {
            AuthResponse r = new AuthResponse();
            r.token = token;
            r.userId = user.getId();
            r.name = user.getName();
            r.email = user.getEmail();
            r.role = user.getRole().name(); // Convert enum to plain string
            r.department = user.getDepartment();
            r.rollNo = user.getRollNo();
            r.employeeId = user.getEmployeeId();
            return r;
        }
    }
}