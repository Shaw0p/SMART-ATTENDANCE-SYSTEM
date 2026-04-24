package com.srats.service;

import com.srats.dto.SessionDto;
import com.srats.entity.ClassSession;
import com.srats.entity.Notification;
import com.srats.entity.User;
import com.srats.repository.ClassSessionRepository;
import com.srats.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SessionService {

    @Autowired private ClassSessionRepository sessionRepository;
    @Autowired private NotificationRepository notificationRepository;

    @Transactional
    public SessionDto.SessionResponse startSession(User teacher, SessionDto.StartSessionRequest req) {
        // Check for existing active session for this teacher and subject
        sessionRepository.findByTeacherAndActiveTrue(teacher)
                .ifPresent(existing -> {
                    if (existing.getSubject().equalsIgnoreCase(req.getSubject())) {
                        throw new RuntimeException("A live session for " + req.getSubject() + " is already active.");
                    }
                    // Closing other active sessions for this teacher (different subject)
                    existing.setActive(false);
                    existing.setEndTime(LocalDateTime.now());
                    sessionRepository.save(existing);
                });

        ClassSession session = ClassSession.builder()
                .teacher(teacher)
                .subject(req.getSubject())
                .section(req.getSection())
                .room(req.getRoom())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .radius(req.getRadius() != null ? req.getRadius() : 50.0)
                .qrToken(UUID.randomUUID().toString())
                .startTime(LocalDateTime.now())
                .build();

        ClassSession saved = sessionRepository.save(session);
        // Ensure the returned entity has the qrToken (refresh from DB if needed)
        if (saved.getQrToken() == null) {
            saved = sessionRepository.findById(saved.getId()).orElse(saved);
        }

        // Notify live feed
        notificationRepository.save(Notification.builder()
                .message("Session started by " + teacher.getName() +
                         " — " + req.getSubject() +
                         (req.getRoom() != null ? " • Room " + req.getRoom() : ""))
                .type(Notification.Type.INFO)
                .build());

        return SessionDto.SessionResponse.from(saved);
    }

    @Transactional
    public SessionDto.SessionResponse endSession(User teacher, Long sessionId) {
        ClassSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Not authorized to end this session");
        }

        session.setActive(false);
        session.setEndTime(LocalDateTime.now());
        ClassSession saved = sessionRepository.save(session);
        return SessionDto.SessionResponse.from(saved);
    }

    public SessionDto.SessionResponse getActiveSession(User teacher) {
        ClassSession session = sessionRepository.findByTeacherAndActiveTrue(teacher)
                .orElseThrow(() -> new RuntimeException("No active session"));
        return SessionDto.SessionResponse.from(session);
    }

    @Transactional
    public SessionDto.SessionResponse refreshQr(User teacher, Long sessionId) {
        ClassSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Not authorized");
        }

        session.setQrToken(UUID.randomUUID().toString());
        ClassSession saved = sessionRepository.save(session);
        return SessionDto.SessionResponse.from(saved);
    }

    public List<SessionDto.SessionResponse> getTeacherSessions(User teacher) {
        return sessionRepository.findByTeacherOrderByStartTimeDesc(teacher)
                .stream()
                .map(SessionDto.SessionResponse::from)
                .collect(Collectors.toList());
    }
}
