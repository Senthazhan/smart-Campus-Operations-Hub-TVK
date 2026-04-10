package com.smartcampus.dto.response;

import java.time.LocalTime;

public record ResourceTimeFitPreviewResponse(
    ResourceResponse resource,
    String previewStatus,
    String previewReason,
    boolean withinOperatingHours,
    boolean conflicting,
    LocalTime conflictStart,
    LocalTime conflictEnd
) {}
