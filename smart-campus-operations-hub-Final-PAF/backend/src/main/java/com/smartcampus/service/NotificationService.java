package com.smartcampus.service;

import com.smartcampus.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
  void send(String userId, com.smartcampus.enums.NotificationType type, String title, String message, String entityType, String entityId);

  void broadcastToAdmins(com.smartcampus.enums.NotificationType type, String title, String message, String entityType, String entityId);

  Page<NotificationResponse> list(Pageable pageable);

  void markRead(String id);

  void markReadAll();
}

