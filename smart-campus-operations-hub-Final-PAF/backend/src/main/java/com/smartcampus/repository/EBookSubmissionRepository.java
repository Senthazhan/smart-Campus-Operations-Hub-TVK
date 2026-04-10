package com.smartcampus.repository;

import com.smartcampus.entity.EBookSubmission;
import com.smartcampus.enums.EBookSubmissionStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EBookSubmissionRepository extends MongoRepository<EBookSubmission, String> {
  List<EBookSubmission> findBySubmittedByOrderBySubmittedAtDesc(String submittedBy);

  Page<EBookSubmission> findByStatus(EBookSubmissionStatus status, Pageable pageable);

  Optional<EBookSubmission> findByPublishedEbookId(String publishedEbookId);
}
