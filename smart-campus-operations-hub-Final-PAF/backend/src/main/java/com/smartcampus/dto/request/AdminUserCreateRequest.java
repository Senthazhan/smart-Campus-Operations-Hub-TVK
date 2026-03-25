package com.smartcampus.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminUserCreateRequest(
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20)
    String username,

    @NotBlank(message = "Email is required")
    @Email
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 6)
    String password,

    @NotBlank(message = "Full name is required")
    String fullName,

    String phone,
    String department,
    String role, // ADMIN, TECHNICIAN, USER
    String status // ACTIVE, INACTIVE, SUSPENDED
) {}
