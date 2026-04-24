package com.srats.dto;

import com.srats.entity.AttendanceRecord;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class AttendanceDto {

    @Data
    public static class MarkAttendanceRequest {
        @NotBlank private String qrToken;
        private Double studentLat;  // Optional — GPS may be unavailable on HTTP
        private Double studentLon;
    }

    @Data
    public static class MarkAttendanceResponse {
        private boolean success;
        private AttendanceRecord.Status status;
        private String message;
        private Double distanceMeters;
        private Double allowedRadius;
        private String subject;
        private LocalDateTime markedAt;
    }

    @Data
    public static class SubjectAttendance {
        private String subject;
        private long total;
        private long present;
        private long absent;
        private double percentage;
        private String statusLabel; // GOOD / LOW / CRITICAL
    }

    @Data
    public static class StudentSummary {
        private double overallPercentage;
        private long totalClasses;
        private long totalPresent;
        private long totalAbsent;
        private int streakDays;
    }
}
