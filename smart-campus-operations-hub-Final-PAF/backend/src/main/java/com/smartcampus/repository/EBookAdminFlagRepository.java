package com.smartcampus.repository;

import com.smartcampus.entity.EBookAdminFlag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EBookAdminFlagRepository extends MongoRepository<EBookAdminFlag, String> {
  Page<EBookAdminFlag> findAllByOrderByCreatedAtDesc(Pageable pageable);

  void deleteByEbookId(String ebookId);
}
