package com.smartcampus.dto.request;

import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TicketCreateRequest(
    String resourceId,
    @Size(max = 255) String locationText,
    @NotBlank @Size(max = 255) String title,
    @NotNull TicketCategory category,
    @NotNull TicketPriority priority,
    @NotBlank @Size(max = 8000) String description,
    @NotBlank @Size(max = 255) String preferredContact
) {}

