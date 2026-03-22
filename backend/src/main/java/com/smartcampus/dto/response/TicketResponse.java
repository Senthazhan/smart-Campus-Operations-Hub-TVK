package com.smartcampus.dto.response;

import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import java.time.Instant;
import java.util.List;

public record TicketResponse(
    String id,
    String ticketNumber,
    String title,
    String resourceId,
    String locationText,
    TicketCategory category,
    TicketPriority priority,
    String description,
    String preferredContact,
    TicketStatus status,
    String createdBy,
    String createdByEmail,
    String createdByFullName,
    String assignedTechnicianId,
    String assignedTechnicianEmail,
    String assignedTechnicianName,
    String resolutionNotes,
    String rejectionReason,
    Instant createdAt,
    Instant updatedAt,
    Instant closedAt,
    Instant targetResolutionTime,
    String slaStatus,
    List<TicketAttachmentResponse> attachments,
    List<TicketCommentResponse> comments
) {}

