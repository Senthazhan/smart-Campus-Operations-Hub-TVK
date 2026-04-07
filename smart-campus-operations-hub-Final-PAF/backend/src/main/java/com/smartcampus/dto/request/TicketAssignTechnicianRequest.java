package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotNull;

public record TicketAssignTechnicianRequest(
    @NotNull String technicianUserId
) {}

