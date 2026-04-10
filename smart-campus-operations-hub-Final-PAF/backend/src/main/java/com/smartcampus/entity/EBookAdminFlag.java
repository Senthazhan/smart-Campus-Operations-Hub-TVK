package com.smartcampus.entity;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** Internal admin flag on a library title. Collection: ebook_admin_flags */
@Getter
@Setter
@Document(collection = "ebook_admin_flags")
public class EBookAdminFlag {
  @Id
  private String id;

  @Indexed
  private String ebookId;

  private String flaggedBy;

  private String note;

  private Instant createdAt;
}
