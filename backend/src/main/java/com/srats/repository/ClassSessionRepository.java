package com.srats.repository;

import com.srats.entity.ClassSession;
import com.srats.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findByTeacherOrderByStartTimeDesc(User teacher);
    Optional<ClassSession> findByQrToken(String qrToken);
    Optional<ClassSession> findByTeacherAndActiveTrue(User teacher);
    List<ClassSession> findByActiveTrue();
    long countByActiveTrue();

    long countBySubject(String subject);
    long countBySubjectAndTeacher_Department(String subject, String department);
}
