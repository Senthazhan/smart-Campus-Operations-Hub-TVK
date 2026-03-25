package com.smartcampus.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonFormat;

public record BookingCreateRequest(
    @NotNull String resourceId,
    @NotNull LocalDate bookingDate,
    @NotNull @JsonFormat(pattern = "HH:mm") LocalTime startTime,
    @NotNull @JsonFormat(pattern = "HH:mm") LocalTime endTime,
    @NotBlank @Size(max = 255) String purpose,
    @Min(1) @Max(5000) int expectedAttendees,
    @Size(max = 5000) String notes
) {}

