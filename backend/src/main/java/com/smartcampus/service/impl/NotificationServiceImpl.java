package com.smartcampus.service.impl;

import com.smartcampus.dto.response.NotificationResponse;
import com.smartcampus.dto.response.NotificationSummaryResponse;
import com.smartcampus.exception.NotFoundException;
import com.smartcampus.mapper.NotificationMapper;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.service.NotificationService;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

  private final NotificationRepository notificationRepository;
  private final NotificationMapper notificationMapper;
  private final com.smartcampus.repository.UserRepository userRepository;
  private final com.smartcampus.repository.RoleRepository roleRepository;

  @Override
  @Transactional
  public void send(String userId, com.smartcampus.enums.NotificationType type, String title, String message, String entityType, String entityId) {
    if (userId == null) return;
    var user = userRepository.findById(userId).orElse(null);
    if (user == null) return;

    var n = new com.smartcampus.entity.Notification();
    n.setUser(user);
    n.setType(type);
    n.setTitle(title);
    n.setMessage(message);
    n.setEntityType(entityType);
    n.setEntityId(entityId);
    n.setRead(false);
    notificationRepository.save(n);
  }

  @Override
  @Transactional
  public void broadcastToAdmins(com.smartcampus.enums.NotificationType type, String title, String message, String entityType, String entityId) {
    var adminRole = roleRepository.findByName(com.smartcampus.enums.RoleName.ADMIN).orElse(null);
    if (adminRole == null) return;

    var admins = userRepository.findAllByRole(adminRole);
    admins.forEach(admin -> send(admin.getId(), type, title, message, entityType, entityId));
  }

  @Override
  @Transactional(readOnly = true)
  public Page<NotificationResponse> list(Pageable pageable, Boolean read) {
    String userId = CurrentUser.id();

    Page<com.smartcampus.entity.Notification> page;
    if (read == null) {
      page = notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable);
    } else {
      page = notificationRepository.findAllByUserIdAndReadOrderByCreatedAtDesc(userId, read, pageable);
    }

    return page.map(notificationMapper::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public NotificationSummaryResponse summary() {
    String userId = CurrentUser.id();

    long total = notificationRepository.countByUserId(userId);
    long unread = notificationRepository.countByUserIdAndRead(userId, false);
    long read = notificationRepository.countByUserIdAndRead(userId, true);

    return new NotificationSummaryResponse(total, unread, read);
  }

  @Override
  public void markRead(String id) {
    var n = notificationRepository.findById(id).orElseThrow(() -> new NotFoundException("Notification not found"));
    if (!n.getUser().getId().equals(CurrentUser.id())) {
      throw new NotFoundException("Notification not found");
    }
    if (!n.isRead()) {
      n.setRead(true);
      n.setReadAt(Instant.now());
      notificationRepository.save(n);
    }
  }

  @Override
  @Transactional
  public void markReadAll() {
    var page = notificationRepository.findAllByUserIdOrderByCreatedAtDesc(CurrentUser.id(), Pageable.unpaged());
    page.forEach(n -> {
      if (!n.isRead()) {
        n.setRead(true);
        n.setReadAt(Instant.now());
      }
    });
    notificationRepository.saveAll(page.getContent());
  }
}