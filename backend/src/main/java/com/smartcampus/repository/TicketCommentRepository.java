package com.smartcampus.repository;

import com.smartcampus.entity.TicketComment;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketCommentRepository extends MongoRepository<TicketComment, String> {
  List<TicketComment> findAllByTicketIdOrderByCreatedAtAsc(String ticketId);
}

