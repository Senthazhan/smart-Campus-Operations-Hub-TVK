package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AdminUserUpdateRequest(
    @NotBlank(message = "Full name is required")
    String fullName,
    String phone,
    String department,
    String status,
    String language,
    String timezone
) {}
