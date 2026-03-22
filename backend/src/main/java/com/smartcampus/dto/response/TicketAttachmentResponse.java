package com.smartcampus.dto.response;

import java.time.Instant;

public record TicketAttachmentResponse(
    String id,
    String ticketId,
    String originalFileName,
    String contentType,
    long sizeBytes,
    String uploadedBy,
    Instant uploadedAt
) {}

