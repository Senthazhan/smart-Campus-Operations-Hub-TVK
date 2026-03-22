package com.smartcampus.dto.response;

import com.smartcampus.enums.RoleName;

public record MeResponse(
    String id,
    String email,
    String fullName,
    String avatarUrl,
    String phone,
    String department,
    String language,
    String timezone,
    boolean emailNotifications,
    boolean pushNotifications,
    RoleName role
) {}
