package com.srats.controller;

import com.srats.dto.SessionDto;
import com.srats.entity.AttendanceRecord;
import com.srats.entity.User;
import com.srats.repository.AttendanceRecordRepository;
import com.srats.repository.ClassSessionRepository;
import com.srats.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher/sessions")
public class SessionController extends BaseController {

    @Autowired private SessionService sessionService;
    @Autowired private ClassSessionRepository sessionRepo;
    @Autowired private AttendanceRecordRepository attendanceRepo;

    @PostMapping("/start")
    public ResponseEntity<SessionDto.SessionResponse> start(
            @AuthenticationPrincipal Object principal,
            @Valid @RequestBody SessionDto.StartSessionRequest req) {
        try {
            System.out.println(">>> start() called — principal type: "
                    + (principal == null ? "NULL" : principal.getClass().getSimpleName())
                    + " value: " + principal);
            User teacher = getUser(principal);
            System.out.println(">>> Teacher found: " + teacher.getEmail() + " id=" + teacher.getId());
            SessionDto.SessionResponse result = sessionService.startSession(teacher, req);
            System.out.println(">>> startSession() success — sessionId=" + result.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println(">>> ERROR in start(): " + e.getClass().getSimpleName() + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/check-conflict")
    public ResponseEntity<Map<String, Object>> checkConflict(
            @AuthenticationPrincipal Object principal,
            @RequestParam String subject) {
        User teacher = getUser(principal);
        boolean hasConflict = sessionRepo.findByTeacherAndActiveTrue(teacher)
                .map(s -> s.getSubject().equalsIgnoreCase(subject))
                .orElse(false);
        
        Map<String, Object> response = new HashMap<>();
        response.put("conflict", hasConflict);
        if (hasConflict) {
            response.put("message", "You already have an active session for " + subject);
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<SessionDto.SessionResponse> end(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id) {
        try {
            System.out.println(">>> end() called — principal=" + principal + " sessionId=" + id);
            User teacher = getUser(principal);
            SessionDto.SessionResponse result = sessionService.endSession(teacher, id);
            System.out.println(">>> endSession() success");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println(">>> ERROR in end(): " + e.getClass().getSimpleName() + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActive(@AuthenticationPrincipal Object principal) {
        try {
            System.out.println(">>> getActive() called — principal=" + principal);
            User teacher = getUser(principal);
            System.out.println(">>> Teacher resolved: " + teacher.getEmail());
            SessionDto.SessionResponse session = sessionService.getActiveSession(teacher);
            sessionRepo.findById(session.getId()).ifPresent(s -> {
                session.setPresentCount(attendanceRepo
                    .countBySessionAndStatus(s, AttendanceRecord.Status.PRESENT));
                session.setTotalEnrolled(attendanceRepo.countBySession(s));
            });
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            // Expected when no active session exists — log but return 204
            System.out.println(">>> getActive() no session (or error): "
                    + e.getClass().getSimpleName() + ": " + e.getMessage());
            return ResponseEntity.noContent().build();
        }
    }

    @PostMapping("/{id}/refresh-qr")
    public ResponseEntity<SessionDto.SessionResponse> refreshQr(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id) {
        try {
            System.out.println(">>> refreshQr() called — principal=" + principal + " sessionId=" + id);
            User teacher = getUser(principal);
            SessionDto.SessionResponse result = sessionService.refreshQr(teacher, id);
            System.out.println(">>> refreshQr() success");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println(">>> ERROR in refreshQr(): " + e.getClass().getSimpleName() + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<SessionDto.SessionResponse>> getMySessions(
            @AuthenticationPrincipal Object principal) {
        try {
            System.out.println(">>> getMySessions() called — principal=" + principal);
            User teacher = getUser(principal);
            List<SessionDto.SessionResponse> result = sessionService.getTeacherSessions(teacher);
            System.out.println(">>> getMySessions() returning " + result.size() + " sessions");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println(">>> ERROR in getMySessions(): " + e.getClass().getSimpleName() + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{id}/attendance")
    public ResponseEntity<?> getSessionAttendance(
            @AuthenticationPrincipal Object principal,
            @PathVariable Long id) {
        System.out.println(">>> getSessionAttendance() called — principal=" + principal + " sessionId=" + id);
        return sessionRepo.findById(id)
                .map(s -> {
                    List<AttendanceRecord> records = attendanceRepo.findBySessionOrderByMarkedAtDesc(s);
                    List<Map<String, Object>> response = records.stream().map(r -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", r.getId());
                        map.put("status", r.getStatus().name());
                        map.put("markedAt", r.getMarkedAt());
                        map.put("distanceMeters", r.getDistanceMeters());
                        if (r.getStudent() != null) {
                            Map<String, Object> studentMap = new HashMap<>();
                            studentMap.put("name", r.getStudent().getName());
                            studentMap.put("rollNo", r.getStudent().getRollNo());
                            studentMap.put("email", r.getStudent().getEmail());
                            map.put("student", studentMap);
                        }
                        return map;
                    }).collect(Collectors.toList());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}