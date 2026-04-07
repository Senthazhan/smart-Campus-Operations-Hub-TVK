package com.smartcampus.repository;

import com.smartcampus.entity.TicketAttachment;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketAttachmentRepository extends MongoRepository<TicketAttachment, String> {
  long countByTicketId(String ticketId);

  List<TicketAttachment> findAllByTicketId(String ticketId);
}

