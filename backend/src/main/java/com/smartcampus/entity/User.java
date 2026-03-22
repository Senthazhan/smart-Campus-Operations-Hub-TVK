package com.smartcampus.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Document(collection = "users")
public class User {
  @Id
  private String id;

  @Indexed(unique = true)
  private String username;

  @Indexed(unique = true)
  private String email;

  private String password;

  private String fullName;

  private String department;

  private String phone;

  private String status = "ACTIVE"; // ACTIVE, INACTIVE, SUSPENDED

  private String avatarUrl;

  private String language = "en";

  private String timezone = "UTC";

  private boolean emailNotifications = true;

  private boolean pushNotifications = true;

  @DocumentReference
  private Role role;

  private String provider;

  private String providerSubject;

  private Instant createdAt = Instant.now();

  private Instant updatedAt = Instant.now();
}
