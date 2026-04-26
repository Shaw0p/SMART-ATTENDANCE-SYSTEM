package com.srats.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "class_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Column(nullable = false)
    private String subject;

    private String section;
    private String room;

    private Double latitude;
    private Double longitude;

    @Builder.Default
    private Double radius = 50.0;

    @Column(nullable = false)
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Column(nullable = false, unique = true)
    private String qrToken;

    @Builder.Default
    private boolean active = true;

    @PrePersist
    protected void onCreate() {
        if (qrToken == null) qrToken = UUID.randomUUID().toString();
        if (startTime == null) startTime = LocalDateTime.now();
    }
}
