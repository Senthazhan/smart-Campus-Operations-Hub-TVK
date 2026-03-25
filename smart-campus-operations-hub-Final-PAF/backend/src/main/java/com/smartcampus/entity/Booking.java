package com.smartcampus.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;
import com.smartcampus.enums.BookingStatus;

@Getter
@Setter
@Document(collection = "bookings")
public class Booking {
  @Id
  private String id;

  @DocumentReference
  private Resource resource;

  @DocumentReference
  private User user;

  private LocalDate bookingDate;

  private LocalTime startTime;

  private LocalTime endTime;

  private String purpose;

  private int expectedAttendees;

  private String notes;

  private BookingStatus status;

  private String decisionReason;

  @DocumentReference
  private User decidedBy;

  private Instant decidedAt;

  private Instant createdAt = Instant.now();

  private Instant updatedAt = Instant.now();
}
