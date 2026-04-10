package com.smartcampus.entity;

import com.smartcampus.enums.EBookSubmissionStatus;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * User-submitted PDF pending admin review. Collection: ebook_submissions
 */
@Getter
@Setter
@Document(collection = "ebook_submissions")
public class EBookSubmission {
  @Id
  private String id;

  private String title;

  private String description;

  private String storedFileName;

  private String submittedBy;

  private Instant submittedAt;

  @Indexed
  private EBookSubmissionStatus status;

  private Instant reviewedAt;

  private String reviewedBy;

  /** Set when admin accepts; links submission to the published library entry. */
  private String publishedEbookId;
}
