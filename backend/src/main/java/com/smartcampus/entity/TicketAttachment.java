package com.smartcampus.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Document(collection = "ticket_attachments")
public class TicketAttachment {
  @Id
  private String id;

  @DocumentReference
  private Ticket ticket;

  private String originalFileName;

  private String storedFileName;

  private String contentType;

  private long sizeBytes;

  private String storagePath;

  @DocumentReference
  private User uploadedBy;

  private Instant uploadedAt = Instant.now();
}
