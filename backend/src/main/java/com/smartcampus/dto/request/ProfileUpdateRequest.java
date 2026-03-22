package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ProfileUpdateRequest(
    @NotBlank(message = "Full name is required")
    String fullName,
    String phone,
    String department,
    String language,
    String timezone,
    boolean emailNotifications,
    boolean pushNotifications
) {}
