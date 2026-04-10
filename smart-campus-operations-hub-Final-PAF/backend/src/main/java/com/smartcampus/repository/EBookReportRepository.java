package com.smartcampus.repository;

import com.smartcampus.entity.EBookReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EBookReportRepository extends MongoRepository<EBookReport, String> {
  Page<EBookReport> findAllByOrderByCreatedAtDesc(Pageable pageable);

  void deleteByEbookId(String ebookId);
}
