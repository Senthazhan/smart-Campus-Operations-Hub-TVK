package com.smartcampus.dto.response;

import java.time.Instant;

public record EBookResponse(
    String id,
    String title,
    String description,
    Instant uploadedAt,
    String uploadedBy
) {}
