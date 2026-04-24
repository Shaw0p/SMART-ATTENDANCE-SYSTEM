package com.srats.dto;

import com.srats.entity.ClassSession;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class SessionDto {

    @Data
    public static class StartSessionRequest {
        @NotBlank private String subject;
        private String section;
        private String room;
        @NotNull private Double latitude;
        @NotNull private Double longitude;
        private Double radius = 50.0;
    }

    @Data
    public static class SessionResponse {
        private Long id;
        private String subject;
        private String section;
        private String room;
        private String qrToken;
        private Double latitude;
        private Double longitude;
        private Double radius;
        private LocalDateTime startTime;
        private boolean active;
        private Long presentCount;
        private Long totalEnrolled;

        public static SessionResponse from(ClassSession s) {
            SessionResponse r = new SessionResponse();
            r.id = s.getId();
            r.subject = s.getSubject();
            r.section = s.getSection();
            r.room = s.getRoom();
            r.qrToken = s.getQrToken();
            r.latitude = s.getLatitude();
            r.longitude = s.getLongitude();
            r.radius = s.getRadius();
            r.startTime = s.getStartTime();
            r.active = s.isActive();
            return r;
        }
    }
}
