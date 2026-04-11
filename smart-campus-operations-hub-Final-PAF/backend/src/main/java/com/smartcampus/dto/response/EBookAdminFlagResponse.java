package com.smartcampus.dto.response;

import java.time.Instant;

public record EBookAdminFlagResponse(
    String id,
    String ebookId,
    String ebookTitle,
    String flaggedBy,
    String note,
    Instant createdAt
) {}
