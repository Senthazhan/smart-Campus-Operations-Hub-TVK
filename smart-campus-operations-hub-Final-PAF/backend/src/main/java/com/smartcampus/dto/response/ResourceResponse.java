package com.smartcampus.dto.response;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ResourceResponse(
    String id,
    String name,
    String resourceCode,
    ResourceType type,
    String description,
    int capacity,
    String building,
    String floor,
    String roomNumber,
    String availabilityJson,
    List<String> availableEquipment,
    LocalDate lastMaintenanceDate,
    ResourceStatus status,
    Instant createdAt,
    Instant updatedAt,
    String createdBy,
    String updatedBy
) {}

