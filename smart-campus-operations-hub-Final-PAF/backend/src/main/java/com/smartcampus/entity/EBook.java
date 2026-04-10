package com.smartcampus.entity;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Official e-books in the library (admin upload or accepted user submission).
 * Collection: ebooks
 */
@Getter
@Setter
@Document(collection = "ebooks")
public class EBook {
  @Id
  private String id;

  @Indexed
  private String title;

  private String description;

  /** Stored file name under ebooks/{id}/ */
  private String storedFileName;

  private Instant uploadedAt;

  private String uploadedBy;
}
