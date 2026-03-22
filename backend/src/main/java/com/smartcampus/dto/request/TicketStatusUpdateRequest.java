package com.smartcampus.dto.request;

import com.smartcampus.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TicketStatusUpdateRequest(
    @NotNull TicketStatus status,
    @Size(max = 8000) String resolutionNotes,
    @Size(max = 500) String rejectionReason
) {}

