package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EBookReportCreateRequest(
    @NotBlank @Size(max = 2000) String reason
) {}
