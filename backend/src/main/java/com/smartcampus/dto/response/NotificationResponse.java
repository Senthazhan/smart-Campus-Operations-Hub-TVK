package com.smartcampus.dto.response;

import com.smartcampus.enums.NotificationType;
import java.time.Instant;

public record NotificationResponse(
    String id,
    NotificationType type,
    String title,
    String message,
    String entityType,
    String entityId,
    boolean read,
    Instant createdAt,
    Instant readAt
) {}

