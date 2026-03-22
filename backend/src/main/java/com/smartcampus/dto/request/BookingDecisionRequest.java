package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BookingDecisionRequest(
    @NotBlank @Size(max = 500) String reason
) {}

