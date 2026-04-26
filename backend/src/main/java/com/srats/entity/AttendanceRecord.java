package com.srats.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "session_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ClassSession session;

    @Column(name = "marked_at", nullable = false)
    private LocalDateTime markedAt;

    @Column(name = "student_lat")
    private Double studentLat;

    @Column(name = "student_lon")
    private Double studentLon;

    @Column(name = "distance_meters")
    private Double distanceMeters;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private Status status = Status.PRESENT;

    @PrePersist
    protected void onCreate() {
        if (markedAt == null) markedAt = LocalDateTime.now();
    }

    public enum Status {
        PRESENT, BLOCKED, ABSENT
    }
}
