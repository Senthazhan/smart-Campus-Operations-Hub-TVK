package com.smartcampus.dto.response;

import com.smartcampus.enums.EBookSubmissionStatus;
import java.time.Instant;

public record EBookSubmissionResponse(
    String id,
    String title,
    String description,
    EBookSubmissionStatus status,
    Instant submittedAt,
    String submittedBy,
    Instant reviewedAt,
    String reviewedBy,
    String publishedEbookId
) {}
