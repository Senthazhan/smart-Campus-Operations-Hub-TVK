package com.smartcampus.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import com.smartcampus.enums.RoleName;

@Getter
@Setter
@Document(collection = "roles")
public class Role {
  @Id
  private String id;

  @Indexed(unique = true)
  private RoleName name;

  private Instant createdAt = Instant.now();
}
