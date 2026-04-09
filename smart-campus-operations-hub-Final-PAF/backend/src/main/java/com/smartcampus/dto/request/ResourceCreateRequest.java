package com.smartcampus.dto.request;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.AssertTrue;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record ResourceCreateRequest(
    @NotBlank @Size(max = 255) String name,
    @NotBlank @Size(max = 50) String resourceCode,
    @NotNull ResourceType type,
    @Size(max = 5000) String description,
    @Size(max = 2048) String imageUrl,
    @Min(0) @Max(5000) int capacity,
    @NotBlank @Size(max = 255) String building,
    @Size(max = 30) String floor,
    @Size(max = 50) String roomNumber,
    String availabilityJson,
    @NotNull LocalTime availableFrom,
    @NotNull LocalTime availableTo,
    List<@NotBlank @Size(max = 100) String> availableEquipment,
    LocalDate lastMaintenanceDate,
    @NotNull ResourceStatus status
) {
  @AssertTrue(message = "availableFrom must be before availableTo")
  public boolean isAvailabilityWindowValid() {
    return availableFrom != null && availableTo != null && availableFrom.isBefore(availableTo);
  }
}

