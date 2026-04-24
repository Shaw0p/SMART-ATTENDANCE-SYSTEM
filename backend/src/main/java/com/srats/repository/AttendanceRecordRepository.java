package com.srats.repository;

import com.srats.entity.AttendanceRecord;
import com.srats.entity.ClassSession;
import com.srats.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    Optional<AttendanceRecord> findByStudentAndSession(User student, ClassSession session);

    List<AttendanceRecord> findBySessionOrderByMarkedAtDesc(ClassSession session);

    List<AttendanceRecord> findByStudentOrderByMarkedAtDesc(User student);

    long countBySession(ClassSession session);

    long countBySessionAndStatus(ClassSession session, AttendanceRecord.Status status);

    long countByStudentAndSession_SubjectAndStatus(User student, String subject, AttendanceRecord.Status status);

    // Per-student overall stats
    long countByStudentAndStatus(User student, AttendanceRecord.Status status);

    // Attendance percentage for a student per subject
    @Query("SELECT a.session.subject, " +
           "COUNT(a) as total, " +
           "SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as present " +
           "FROM AttendanceRecord a WHERE a.student = :student " +
           "GROUP BY a.session.subject")
    List<Object[]> getSubjectWiseStats(@Param("student") User student);

    // Campus-wide present today
    @Query("SELECT COUNT(DISTINCT a.student) FROM AttendanceRecord a " +
           "WHERE a.status = 'PRESENT' AND a.markedAt >= :since")
    long countDistinctPresentSince(@Param("since") LocalDateTime since);

    // Department-wise average
    @Query("SELECT u.department, " +
           "COUNT(a) as total, " +
           "SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as present " +
           "FROM AttendanceRecord a JOIN a.student u " +
           "GROUP BY u.department")
    List<Object[]> getDeptWiseStats();

    // Trend: daily attendance count — native query works on both H2 and MySQL
    @Query(value = "SELECT FORMATDATETIME(a.marked_at, 'yyyy-MM-dd') as day, COUNT(a.id) as present " +
                   "FROM attendance_records a " +
                   "JOIN class_sessions s ON a.session_id = s.id " +
                   "WHERE s.subject = :subject AND a.status = 'PRESENT' " +
                   "AND a.marked_at >= :since " +
                   "GROUP BY FORMATDATETIME(a.marked_at, 'yyyy-MM-dd') " +
                   "ORDER BY day",
           nativeQuery = true)
    List<Object[]> getDailyTrend(@Param("subject") String subject, @Param("since") LocalDateTime since);
}

