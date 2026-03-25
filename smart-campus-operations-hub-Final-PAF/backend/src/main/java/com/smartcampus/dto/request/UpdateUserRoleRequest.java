package com.smartcampus.dto.request;

import com.smartcampus.enums.RoleName;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
    @NotNull RoleName role
) {}

