package com.smartcampus.dto.response;

import java.time.Instant;

public record EBookReportResponse(
    String id,
    String ebookId,
    String ebookTitle,
    String reporterUserId,
    String reason,
    Instant createdAt
) {}
