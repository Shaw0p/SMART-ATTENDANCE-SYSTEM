package com.srats.service;

import com.srats.dto.AttendanceDto;
import com.srats.entity.AttendanceRecord;
import com.srats.entity.ClassSession;
import com.srats.entity.Notification;
import com.srats.entity.User;
import com.srats.repository.AttendanceRecordRepository;
import com.srats.repository.ClassSessionRepository;
import com.srats.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRecordRepository attendanceRepo;
    @Autowired
    private ClassSessionRepository sessionRepo;
    @Autowired
    private NotificationRepository notificationRepo;

    /**
     * Core attendance marking logic. 1. Validate QR token → find active session
     * 2. Check if already marked 3. Haversine distance check 4. Mark PRESENT or
     * BLOCKED
     */
    @Transactional
    public AttendanceDto.MarkAttendanceResponse markAttendance(User student,
            AttendanceDto.MarkAttendanceRequest req) {
        AttendanceDto.MarkAttendanceResponse response = new AttendanceDto.MarkAttendanceResponse();

        // 1. Find session by QR token
        Optional<ClassSession> sessionOpt = sessionRepo.findByQrToken(req.getQrToken());
        if (sessionOpt.isEmpty() || !sessionOpt.get().isActive()) {
            response.setSuccess(false);
            response.setStatus(AttendanceRecord.Status.BLOCKED);
            response.setMessage("Invalid or expired QR code");
            return response;
        }

        ClassSession session = sessionOpt.get();

        // 2. Already marked?
        if (attendanceRepo.findByStudentAndSession(student, session).isPresent()) {
            response.setSuccess(false);
            response.setStatus(AttendanceRecord.Status.PRESENT);
            response.setMessage("Attendance already marked for this session");
            response.setSubject(session.getSubject());
            return response;
        }

        // 3. GPS distance check — GPS still verified and logged
        //    Effective radius = max(stored, 500m) to handle PC browser GPS inaccuracy
        AttendanceRecord.Status status;
        double distance = -1;

        boolean studentHasGps = req.getStudentLat() != null && req.getStudentLon() != null;
        boolean sessionHasGps = session.getLatitude() != null
                && Math.abs(session.getLatitude()) > 0.001
                && session.getLongitude() != null
                && Math.abs(session.getLongitude()) > 0.001;

        System.out.println(">>> GPS check: studentHasGps=" + studentHasGps
                + " sessionHasGps=" + sessionHasGps
                + " storedRadius=" + session.getRadius());

        if (studentHasGps && sessionHasGps) {
            distance = haversine(
                    req.getStudentLat(), req.getStudentLon(),
                    session.getLatitude(), session.getLongitude()
            );
            double effectiveRadius = session.getRadius() != null ? session.getRadius() : 50.0;
            System.out.println(">>> STRICT GEOFENCE: Distance=" + Math.round(distance) + "m vs Limit=" + effectiveRadius + "m");
            status = distance <= effectiveRadius
                    ? AttendanceRecord.Status.PRESENT
                    : AttendanceRecord.Status.BLOCKED;
        } else {
            System.out.println(">>> No valid GPS on student/session — marking PRESENT");
            status = AttendanceRecord.Status.PRESENT;
        }

        // 4. Save record
        AttendanceRecord record = AttendanceRecord.builder()
                .student(student)
                .session(session)
                .studentLat(req.getStudentLat())
                .studentLon(req.getStudentLon())
                .distanceMeters(distance >= 0 ? distance : null)
                .status(status)
                .build();

        attendanceRepo.save(record);

        // 5. Notification for live feed
        if (status == AttendanceRecord.Status.PRESENT) {
            notificationRepo.save(Notification.builder()
                    .message(student.getName() + " marked present in " + session.getSubject())
                    .type(Notification.Type.INFO)
                    .build());
        } else {
            String msg = "PROXY BLOCKED — " + student.getName()
                    + " attempted in " + session.getSubject()
                    + " from " + Math.round(distance) + "m away";
            notificationRepo.save(Notification.builder()
                    .message(msg)
                    .type(Notification.Type.DANGER)
                    .build());
        }

        response.setSuccess(status == AttendanceRecord.Status.PRESENT);
        response.setStatus(status);
        if (distance >= 0) {
            response.setDistanceMeters(distance);
        }
        response.setAllowedRadius(session.getRadius());
        response.setSubject(session.getSubject());
        response.setMarkedAt(record.getMarkedAt());
        response.setMessage(status == AttendanceRecord.Status.PRESENT
                ? "Attendance marked successfully!"
                : "Blocked: You are " + Math.round(distance) + "m from the classroom (limit: "
                + Math.round(session.getRadius()) + "m)");

        return response;
    }

    /**
     * Returns subject-wise attendance breakdown for a student
     */
    public List<AttendanceDto.SubjectAttendance> getSubjectWise(User student) {
        List<Object[]> rows = attendanceRepo.getSubjectWiseStats(student);
        List<AttendanceDto.SubjectAttendance> result = new ArrayList<>();

        for (Object[] row : rows) {
            AttendanceDto.SubjectAttendance sa = new AttendanceDto.SubjectAttendance();
            sa.setSubject((String) row[0]);
            sa.setTotal(((Number) row[1]).longValue());
            sa.setPresent(((Number) row[2]).longValue());
            sa.setAbsent(sa.getTotal() - sa.getPresent());
            sa.setPercentage(sa.getTotal() == 0 ? 0 : (sa.getPresent() * 100.0 / sa.getTotal()));
            sa.setStatusLabel(sa.getPercentage() >= 75 ? "GOOD"
                    : sa.getPercentage() >= 65 ? "LOW" : "CRITICAL");
            result.add(sa);
        }
        return result;
    }

    public AttendanceDto.StudentSummary getStudentSummary(User student) {
        AttendanceDto.StudentSummary s = new AttendanceDto.StudentSummary();
        long present = attendanceRepo.countByStudentAndStatus(student, AttendanceRecord.Status.PRESENT);
        long blocked = attendanceRepo.countByStudentAndStatus(student, AttendanceRecord.Status.BLOCKED);
        long total = present + blocked;

        s.setTotalPresent(present);
        s.setTotalAbsent(blocked);
        s.setTotalClasses(total);
        s.setOverallPercentage(total == 0 ? 0 : (present * 100.0 / total));
        s.setStreakDays(calculateStreak(student));
        return s;
    }

    // ─── Haversine Formula ───────────────────────────────────────────────────
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // metres
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private int calculateStreak(User student) {
        List<AttendanceRecord> records = attendanceRepo.findByStudentOrderByMarkedAtDesc(student);
        if (records.isEmpty()) {
            return 0;
        }

        int streak = 0;
        LocalDateTime prev = LocalDateTime.now().toLocalDate().atStartOfDay().plusDays(1);
        for (AttendanceRecord r : records) {
            if (r.getStatus() != AttendanceRecord.Status.PRESENT) {
                continue;
            }
            LocalDateTime day = r.getMarkedAt().toLocalDate().atStartOfDay();
            long diff = java.time.Duration.between(day, prev).toDays();
            if (diff <= 1) {
                streak++;
                prev = day;
            } else {
                break;
            }
        }
        return streak;
    }
}
