package com.smartcampus.dto.response;

import java.time.Instant;

public record TicketCommentResponse(
    String id,
    String authorId,
    String authorEmail,
    String body,
    boolean edited,
    Instant createdAt,
    Instant updatedAt
) {}

