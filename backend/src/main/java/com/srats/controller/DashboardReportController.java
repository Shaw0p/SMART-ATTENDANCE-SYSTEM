package com.srats.controller;

import com.srats.entity.User;
import com.srats.service.DashboardService;
import com.srats.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardReportController extends BaseController {

    @Autowired private DashboardService dashboardService;
    @Autowired private ReportService reportService;

    @GetMapping("/teacher/dashboard")
    public ResponseEntity<Map<String, Object>> teacherDashboard(
            @AuthenticationPrincipal Object principal) {
        User teacher = getUser(principal);
        return ResponseEntity.ok(dashboardService.getTeacherDashboard(teacher));
    }

    @GetMapping("/reports/defaulters")
    public ResponseEntity<List<Map<String, Object>>> defaulters(
            @RequestParam(defaultValue = "75") double threshold) {
        return ResponseEntity.ok(reportService.getDefaulters(threshold));
    }

    @GetMapping("/reports/trend")
    public ResponseEntity<List<Map<String, Object>>> trend(
            @RequestParam String subject,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(reportService.getTrend(subject, days));
    }
}
