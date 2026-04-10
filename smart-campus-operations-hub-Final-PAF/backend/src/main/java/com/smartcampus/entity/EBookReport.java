package com.smartcampus.entity;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * User reports about an e-book. Collection: ebook_reports
 */
@Getter
@Setter
@Document(collection = "ebook_reports")
public class EBookReport {
  @Id
  private String id;

  @Indexed
  private String ebookId;

  private String reporterUserId;

  private String reason;

  private Instant createdAt;
}
