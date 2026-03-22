package com.smartcampus.repository;

import com.smartcampus.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, String> {
  Page<Notification> findAllByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
}

