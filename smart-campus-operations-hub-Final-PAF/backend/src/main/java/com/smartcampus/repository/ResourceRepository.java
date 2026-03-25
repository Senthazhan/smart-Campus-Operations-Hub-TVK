package com.smartcampus.repository;

import com.smartcampus.entity.Resource;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {
  Optional<Resource> findByResourceCode(String resourceCode);
}

