package com.smartcampus.entity;

import com.smartcampus.enums.NotificationType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Document(collection = "notifications")
public class Notification {
  @Id
  private String id;

  @DocumentReference
  private User user;

  private NotificationType type;

  private String title;

  private String message;

  private String entityType;

  private String entityId;

  private boolean read;

  private Instant createdAt = Instant.now();

  private Instant readAt;
}
