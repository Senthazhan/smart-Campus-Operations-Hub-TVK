package com.smartcampus.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Document(collection = "ticket_comments")
public class TicketComment {
  @Id
  private String id;

  @DocumentReference
  private Ticket ticket;

  @DocumentReference
  private User author;

  private String body;

  private boolean edited;

  private Instant createdAt = Instant.now();

  private Instant updatedAt = Instant.now();
}
