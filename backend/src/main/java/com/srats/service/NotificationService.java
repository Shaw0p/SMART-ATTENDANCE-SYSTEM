package com.srats.service;

import com.srats.entity.Notification;
import com.srats.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired private NotificationRepository notificationRepo;

    public List<Notification> getRecent() {
        return notificationRepo.findTop20ByOrderByCreatedAtDesc();
    }

    public Notification create(String message, Notification.Type type) {
        return notificationRepo.save(Notification.builder()
                .message(message).type(type).build());
    }

    public void markRead(Long id) {
        notificationRepo.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepo.save(n);
        });
    }
}
