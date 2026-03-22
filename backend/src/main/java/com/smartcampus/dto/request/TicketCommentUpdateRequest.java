package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TicketCommentUpdateRequest(
    @NotBlank @Size(max = 4000) String body
) {}

