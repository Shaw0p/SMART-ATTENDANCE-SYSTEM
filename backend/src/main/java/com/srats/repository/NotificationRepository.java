package com.srats.repository;

import com.srats.entity.Notification;
import com.srats.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.user = :user OR n.user IS NULL " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findRecentForUser(User user, org.springframework.data.domain.Pageable pageable);

    List<Notification> findTop20ByOrderByCreatedAtDesc();

    List<Notification> findByUserOrUserIsNullOrderByCreatedAtDesc(User user);
}
