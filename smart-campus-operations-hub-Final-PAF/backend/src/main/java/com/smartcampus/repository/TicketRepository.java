package com.smartcampus.repository;

import com.smartcampus.entity.Ticket;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<Ticket, String> {
  Page<Ticket> findAllByCreatedById(String userId, Pageable pageable);

  Page<Ticket> findAllByAssignedTechnicianId(String technicianId, Pageable pageable);

  Optional<Ticket> findByTicketNumber(String ticketNumber);
}

