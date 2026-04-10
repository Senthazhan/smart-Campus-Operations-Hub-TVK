package com.smartcampus.dto.request;

import jakarta.validation.constraints.Size;

public record EBookAdminFlagCreateRequest(
    @Size(max = 2000) String note
) {}
