package com.smartcampus.dto.response;

public record NotificationSummaryResponse(
    long total,
    long unread,
    long read
) {}