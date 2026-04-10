package com.smartcampus.repository;

import com.smartcampus.entity.EBook;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EBookRepository extends MongoRepository<EBook, String> {}
