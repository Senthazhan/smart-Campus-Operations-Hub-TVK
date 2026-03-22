package com.smartcampus.dto.response;

import com.smartcampus.enums.RoleName;
import java.time.Instant;

public record AdminUserResponse(
    String id,
    String email,
    String fullName,
    String avatarUrl,
    String phone,
    String department,
    String language,
    String timezone,
    RoleName role,
    String status,
    Instant createdAt,
    Instant updatedAt
) {}

