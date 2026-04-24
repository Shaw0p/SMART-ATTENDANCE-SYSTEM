package com.srats.controller;

import com.srats.dto.AttendanceDto;
import com.srats.entity.User;
import com.srats.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class AttendanceController extends BaseController {

    @Autowired private AttendanceService attendanceService;

    /** Core endpoint: student scans QR and submits GPS */
    @PostMapping("/attendance/mark")
    public ResponseEntity<AttendanceDto.MarkAttendanceResponse> mark(
            @AuthenticationPrincipal Object principal,
            @Valid @RequestBody AttendanceDto.MarkAttendanceRequest req) {
        User student = getUser(principal);
        return ResponseEntity.ok(attendanceService.markAttendance(student, req));
    }

    /** Student's subject-wise attendance breakdown */
    @GetMapping("/attendance/subjects")
    public ResponseEntity<List<AttendanceDto.SubjectAttendance>> subjects(
            @AuthenticationPrincipal Object principal) {
        User student = getUser(principal);
        return ResponseEntity.ok(attendanceService.getSubjectWise(student));
    }

    /** Student's overall summary (for dashboard stats) */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(
            @AuthenticationPrincipal Object principal) {
        User student = getUser(principal);
        AttendanceDto.StudentSummary s = attendanceService.getStudentSummary(student);
        List<AttendanceDto.SubjectAttendance> subjects = attendanceService.getSubjectWise(student);
        return ResponseEntity.ok(Map.of(
                "summary", s,
                "subjects", subjects
        ));
    }
}
