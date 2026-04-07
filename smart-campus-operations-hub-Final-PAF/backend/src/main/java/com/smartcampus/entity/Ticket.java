package com.smartcampus.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;

@Getter
@Setter
@Document(collection = "tickets")
public class Ticket {
  @Id
  private String id;

  @Indexed(unique = true)
  private String ticketNumber;

  private String title;

  @DocumentReference
  private Resource resource;

  private String locationText;

  private TicketCategory category;

  private String description;

  private TicketPriority priority;

  private String preferredContact;

  private TicketStatus status;

  @DocumentReference
  private User assignedTechnician;

  private String resolutionNotes;

  private String rejectionReason;

  @DocumentReference
  private User createdBy;

  private Instant createdAt = Instant.now();

  private Instant updatedAt = Instant.now();

  private Instant closedAt;
}
