package com.srats.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String name;

    @Column(name = "user_email", nullable = false, unique = true)
    private String email;

    @Column(name = "user_password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false)
    private Role role;

    @Column(name = "dept")
    private String department;

    @Column(name = "roll_no", unique = true)
    private String rollNo;

    @Column(name = "study_year")
    private Integer studyYear;

    @Column(name = "emp_id", unique = true)
    private String employeeId;

    @Column(name = "user_designation")
    private String designation;

    @Column(name = "user_subject")
    private String subject;

    @Column(name = "user_phone")
    private String phone;

    @Builder.Default
    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Role {
        STUDENT, TEACHER, ADMIN
    }
}
