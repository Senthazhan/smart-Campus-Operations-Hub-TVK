package com.smartcampus.dto.response;

import com.smartcampus.enums.BookingStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record BookingResponse(
    String id,
    String resourceId,
    String resourceName,
    String resourceCode,
    String userId,
    String userEmail,
    LocalDate bookingDate,
    LocalTime startTime,
    LocalTime endTime,
    String purpose,
    int expectedAttendees,
    String notes,
    BookingStatus status,
    String decisionReason,
    String decidedBy,
    Instant decidedAt,
    Instant createdAt,
    Instant updatedAt
) {}

