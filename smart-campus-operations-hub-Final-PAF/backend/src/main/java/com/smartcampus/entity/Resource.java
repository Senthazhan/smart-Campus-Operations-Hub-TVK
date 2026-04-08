package com.smartcampus.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.enums.ResourceStatus;

@Getter
@Setter
@Document(collection = "resources")
public class Resource {
  @Id
  private String id;

  private String name;

  @Indexed(unique = true)
  private String resourceCode;

  private ResourceType type;

  private String description;

  private int capacity;

  private String building;

  private String floor;

  private String roomNumber;

  private String availabilityJson;

  private LocalTime availableFrom;

  private LocalTime availableTo;

  private List<String> availableEquipment;

  private LocalDate lastMaintenanceDate;

  private ResourceStatus status;

  private Instant createdAt = Instant.now();

  private Instant updatedAt = Instant.now();

  private String createdBy;

  private String updatedBy;
}
