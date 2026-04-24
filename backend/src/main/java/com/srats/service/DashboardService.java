package com.srats.service;

import com.srats.entity.AttendanceRecord;
import com.srats.entity.ClassSession;
import com.srats.entity.User;
import com.srats.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class DashboardService {

    @Autowired private UserRepository userRepo;
    @Autowired private ClassSessionRepository sessionRepo;
    @Autowired private AttendanceRecordRepository attendanceRepo;
    @Autowired private ReportService reportService;

    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalStudents", userRepo.countByRole(User.Role.STUDENT));
        data.put("totalFaculty", userRepo.countByRole(User.Role.TEACHER));
        data.put("activeSessions", sessionRepo.countByActiveTrue());

        // Campus-wide attendance today
        LocalDateTime todayStart = LocalDateTime.now().toLocalDate().atStartOfDay();
        long presentToday = attendanceRepo.countDistinctPresentSince(todayStart);
        long totalStudents = userRepo.countByRole(User.Role.STUDENT);
        double campusAttendance = totalStudents == 0 ? 0 : (presentToday * 100.0 / totalStudents);
        data.put("campusAttendancePercent", Math.round(campusAttendance * 10.0) / 10.0);

        // Defaulters (students with overall < 75%)
        data.put("defaulterCount", getDefaulterCount());

        // Department stats
        List<Map<String, Object>> deptStats = new ArrayList<>();
        List<Object[]> rows = attendanceRepo.getDeptWiseStats();
        for (Object[] row : rows) {
            Map<String, Object> d = new LinkedHashMap<>();
            d.put("department", row[0]);
            long total = ((Number) row[1]).longValue();
            long present = ((Number) row[2]).longValue();
            d.put("attendancePercent", total == 0 ? 0 : Math.round(present * 100.0 / total));
            deptStats.add(d);
        }
        data.put("deptStats", deptStats);

        return data;
    }

    public Map<String, Object> getTeacherDashboard(User teacher) {
        Map<String, Object> data = new LinkedHashMap<>();

        List<ClassSession> sessions = sessionRepo.findByTeacherOrderByStartTimeDesc(teacher);
        data.put("totalSessionsHeld", sessions.size());

        // Today's sessions
        LocalDateTime todayStart = LocalDateTime.now().toLocalDate().atStartOfDay();
        long todaySessions = sessions.stream()
                .filter(s -> s.getStartTime().isAfter(todayStart)).count();
        data.put("todaySessionsCount", todaySessions);

        // Active session stats
        Optional<ClassSession> activeOpt = sessionRepo.findByTeacherAndActiveTrue(teacher);
        if (activeOpt.isPresent()) {
            ClassSession active = activeOpt.get();
            long present = attendanceRepo.countBySessionAndStatus(active, AttendanceRecord.Status.PRESENT);
            data.put("livePresent", present);
            data.put("activeSessionId", active.getId());
        } else {
            data.put("livePresent", 0);
            data.put("activeSessionId", null);
        }

        // Average attendance across all sessions
        long totalRecords = 0, totalPresent = 0;
        for (ClassSession s : sessions) {
            totalRecords += attendanceRepo.countBySession(s);
            totalPresent += attendanceRepo.countBySessionAndStatus(s, AttendanceRecord.Status.PRESENT);
        }
        double avgAtt = totalRecords == 0 ? 0 : (totalPresent * 100.0 / totalRecords);
        data.put("avgAttendancePercent", Math.round(avgAtt * 10.0) / 10.0);

        // Defaulter count for teacher's subjects
        long teacherDefaulters = reportService.getDefaulters(75.0).stream()
                .filter(r -> teacher.getDepartment().equals(r.get("department")))
                .count();
        data.put("defaulterCount", teacherDefaulters);

        return data;
    }

    public Map<String, Object> getStudentDashboard(User student) {
        Map<String, Object> data = new LinkedHashMap<>();
        long present = attendanceRepo.countByStudentAndStatus(student, AttendanceRecord.Status.PRESENT);
        long blocked = attendanceRepo.countByStudentAndStatus(student, AttendanceRecord.Status.BLOCKED);
        long total = present + blocked;
        double pct = total == 0 ? 0 : (present * 100.0 / total);

        data.put("overallPercent", Math.round(pct * 10.0) / 10.0);
        data.put("totalClasses", total);
        data.put("totalPresent", present);
        data.put("totalAbsent", blocked);
        return data;
    }

    private long getDefaulterCount() {
        List<User> students = userRepo.findByRole(User.Role.STUDENT);
        long defaulters = 0;
        for (User s : students) {
            long p = attendanceRepo.countByStudentAndStatus(s, AttendanceRecord.Status.PRESENT);
            long b = attendanceRepo.countByStudentAndStatus(s, AttendanceRecord.Status.BLOCKED);
            long t = p + b;
            if (t > 0 && (p * 100.0 / t) < 75.0) defaulters++;
        }
        return defaulters;
    }
}
