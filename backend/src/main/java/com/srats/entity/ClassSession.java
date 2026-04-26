package com.srats.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendance_sessions")
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

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "section")
    private String section;

    @Column(name = "room")
    private String room;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "radius")
    private Double radius = 50.0;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "qr_token", nullable = false, unique = true)
    private String qrToken;

    @Column(name = "is_active")
    private boolean active = true;

    @PrePersist
    protected void onCreate() {
        if (qrToken == null) qrToken = UUID.randomUUID().toString();
        if (startTime == null) startTime = LocalDateTime.now();
    }
}
