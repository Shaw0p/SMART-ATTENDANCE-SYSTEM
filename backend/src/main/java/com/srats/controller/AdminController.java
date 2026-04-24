package com.srats.controller;

import com.srats.entity.User;
import com.srats.repository.UserRepository;
import com.srats.service.DashboardService;
import com.srats.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private DashboardService dashboardService;
    @Autowired private UserRepository userRepo;
    @Autowired private ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/students")
    public ResponseEntity<?> students(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (q.isBlank()) {
            return ResponseEntity.ok(userRepo.findByRole(User.Role.STUDENT));
        }
        return ResponseEntity.ok(userRepo.searchStudents(q, PageRequest.of(page, size)));
    }

    @GetMapping("/faculty")
    public ResponseEntity<?> faculty(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (q.isBlank()) {
            return ResponseEntity.ok(userRepo.findByRole(User.Role.TEACHER));
        }
        return ResponseEntity.ok(userRepo.searchTeachers(q, PageRequest.of(page, size)));
    }

    @GetMapping("/defaulters")
    public ResponseEntity<List<Map<String, Object>>> defaulters(
            @RequestParam(defaultValue = "75") double threshold) {
        return ResponseEntity.ok(reportService.getDefaulters(threshold));
    }

    @PutMapping("/students/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        return userRepo.findById(id).map(u -> {
            u.setActive(false);
            userRepo.save(u);
            return ResponseEntity.ok(Map.of("message", "User deactivated"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
