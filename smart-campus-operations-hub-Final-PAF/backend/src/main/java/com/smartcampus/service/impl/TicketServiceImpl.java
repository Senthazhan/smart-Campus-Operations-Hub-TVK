package com.smartcampus.service.impl;

import com.smartcampus.config.AppProperties;
import com.smartcampus.dto.request.TicketAssignTechnicianRequest;
import com.smartcampus.dto.request.TicketCommentCreateRequest;
import com.smartcampus.dto.request.TicketCommentUpdateRequest;
import com.smartcampus.dto.request.TicketCreateRequest;
import com.smartcampus.dto.request.TicketStatusUpdateRequest;
import com.smartcampus.dto.response.TicketAttachmentResponse;
import com.smartcampus.dto.response.TicketCommentResponse;
import com.smartcampus.dto.response.TicketResponse;
import com.smartcampus.entity.Notification;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.TicketAttachment;
import com.smartcampus.entity.TicketComment;
import com.smartcampus.enums.NotificationType;
import com.smartcampus.enums.RoleName;
import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.ForbiddenException;
import com.smartcampus.exception.NotFoundException;
import com.smartcampus.mapper.TicketMapper;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketAttachmentRepository;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.AppUserPrincipal;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.service.TicketService;
import com.smartcampus.util.FileStorageService;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.LookupOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.support.PageableExecutionUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.function.LongSupplier;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.bson.Document;
import org.bson.types.ObjectId;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketServiceImpl implements TicketService {

  private final TicketRepository ticketRepository;
  private final TicketAttachmentRepository attachmentRepository;
  private final TicketCommentRepository commentRepository;
  private final ResourceRepository resourceRepository;
  private final UserRepository userRepository;
  private final TicketMapper ticketMapper;
  private final FileStorageService fileStorageService;
  private final AppProperties appProperties;
  private final MongoTemplate mongoTemplate;
  private final com.smartcampus.service.NotificationService notificationService;

  @Override
  public TicketResponse create(TicketCreateRequest req) {
    return createWithAttachments(req, new MultipartFile[0]);
  }

  @Override
  @Transactional
  public TicketResponse createWithAttachments(TicketCreateRequest req, MultipartFile[] files) {
    com.smartcampus.entity.User creator = userRepository.findById(CurrentUser.id())
        .orElseThrow(() -> new NotFoundException("User not found"));

    Ticket ticket = new Ticket();
    ticket.setTicketNumber(generateTicketNumber());
    ticket.setTitle(req.title());
    if (req.resourceId() != null && !req.resourceId().isEmpty()) {
      ticket.setResource(
          resourceRepository.findById(req.resourceId()).orElseThrow(() -> new NotFoundException("Resource not found")));
    }
    ticket.setLocationText(req.locationText());
    ticket.setCategory(req.category());
    ticket.setPriority(req.priority());
    ticket.setDescription(req.description());
    ticket.setPreferredContact(req.preferredContact());
    ticket.setStatus(TicketStatus.OPEN);
    ticket.setCreatedBy(creator);

    ticket = ticketRepository.save(ticket);

    // Upload attachments if provided
    if (files != null && files.length > 0) {
      uploadAttachments(ticket.getId(), files);
    }

    notificationService.broadcastToAdmins(
        com.smartcampus.enums.NotificationType.TICKET_SUBMITTED,
        "New Support Ticket",
        "A new " + ticket.getCategory() + " ticket #" + ticket.getTicketNumber() + " has been submitted by " + creator.getFullName(),
        "TICKET",
        ticket.getId());

    return toTicketResponse(ticket, true);
  }

  @Override
  public Page<TicketResponse> list(String q, TicketStatus status, TicketCategory category, TicketPriority priority,
      Pageable pageable) {
    try {
      Authentication auth = CurrentUser.requireAuth();
      RoleName role = extractRole(auth);

      List<AggregationOperation> ops = new ArrayList<>();

      // Initial match for basic filters on Ticket
      List<Criteria> ticketCriteria = new ArrayList<>();
      if (status != null)
        ticketCriteria.add(Criteria.where("status").is(status));
      if (category != null)
        ticketCriteria.add(Criteria.where("category").is(category));
      if (priority != null)
        ticketCriteria.add(Criteria.where("priority").is(priority));

      if (role == RoleName.TECHNICIAN) {
        String techId = CurrentUser.id();
        if (ObjectId.isValid(techId)) {
          ticketCriteria.add(Criteria.where("assignedTechnician").is(new ObjectId(techId)));
        } else {
          ticketCriteria.add(Criteria.where("assignedTechnician").is(techId));
        }
      } else if (role == RoleName.USER) {
        String userId = CurrentUser.id();
        if (ObjectId.isValid(userId)) {
          ticketCriteria.add(Criteria.where("createdBy").is(new ObjectId(userId)));
        } else {
          ticketCriteria.add(Criteria.where("createdBy").is(userId));
        }
      }

      if (!ticketCriteria.isEmpty()) {
        ops.add(Aggregation.match(new Criteria().andOperator(ticketCriteria.toArray(new Criteria[0]))));
      }

      // Lookup for search functionality
      ops.add(
          LookupOperation.newLookup().from("users").localField("createdBy").foreignField("_id")
              .as("reporter_details"));
      ops.add(LookupOperation.newLookup().from("resources").localField("resource").foreignField("_id")
          .as("resource_details"));

      // Add q search criteria
      if (q != null && !q.isBlank()) {
        String regex = q;
        ops.add(Aggregation.match(new Criteria().orOperator(
            Criteria.where("title").regex(regex, "i"),
            Criteria.where("ticketNumber").regex(regex, "i"),
            Criteria.where("reporter_details.email").regex(regex, "i"),
            Criteria.where("resource_details.name").regex(regex, "i"))));
      }

      // Sorting
      if (pageable.getSort().isSorted()) {
        pageable.getSort().forEach(order -> {
          ops.add(Aggregation.sort(order.isAscending() ? org.springframework.data.domain.Sort.Direction.ASC : org.springframework.data.domain.Sort.Direction.DESC, order.getProperty()));
        });
      }

      // Pagination
      ops.add(Aggregation.skip((long) pageable.getOffset()));
      ops.add(Aggregation.limit(pageable.getPageSize()));

      List<Ticket> results = mongoTemplate.aggregate(Aggregation.newAggregation(ops), "tickets", Ticket.class)
            .getMappedResults();

      // Count for pagination
      List<AggregationOperation> countOps = new ArrayList<>();
      if (!ticketCriteria.isEmpty())
        countOps.add(Aggregation.match(new Criteria().andOperator(ticketCriteria.toArray(new Criteria[0]))));
      
      if (q != null && !q.isBlank()) {
        // Only lookup if searching on reporter or resource fields
        countOps.add(LookupOperation.newLookup().from("users").localField("createdBy").foreignField("_id").as("reporter_details"));
        countOps.add(LookupOperation.newLookup().from("resources").localField("resource").foreignField("_id").as("resource_details"));
        
        countOps.add(Aggregation.match(new Criteria().orOperator(
            Criteria.where("title").regex(q, "i"),
            Criteria.where("ticketNumber").regex(q, "i"),
            Criteria.where("reporter_details.email").regex(q, "i"),
            Criteria.where("resource_details.name").regex(q, "i"))));
      }
      countOps.add(Aggregation.count().as("totalCount"));

      long total = 0;
      Document countResult = mongoTemplate.aggregate(Aggregation.newAggregation(countOps), "tickets", Document.class)
          .getUniqueMappedResult();
      if (countResult != null && countResult.containsKey("totalCount")) {
        total = ((java.lang.Number) countResult.get("totalCount")).longValue();
      }
      final long finalTotal = total;
      
      log.info("Ticket list fetched. Found {} results, total: {}", results.size(), finalTotal);
      
      return PageableExecutionUtils.getPage(results, pageable, () -> finalTotal).map(t -> {
        try {
          return toTicketResponse(t, false); // Optimized: no attachments/comments for list
        } catch (Exception e) {
          log.error("Failed to map ticket ID={} to response. Skipping record.", t.getId(), e);
          return null;
        }
      });
    } catch (Exception e) {
      log.error("Failed to list tickets: q={}, status={}, category={}, priority={}", q, status, category, priority, e);
      throw e;
    }
  }

  @Override
  public TicketResponse get(String id) {
    var ticket = ticketRepository.findById(id).orElseThrow(() -> new NotFoundException("Ticket not found"));
    enforceTicketAccess(ticket);
    return toTicketResponse(ticket, true);
  }

  @Override
  public TicketResponse updateStatus(String id, TicketStatusUpdateRequest req) {
    var ticket = ticketRepository.findById(id).orElseThrow(() -> new NotFoundException("Ticket not found"));
    TicketStatus current = ticket.getStatus();
    TicketStatus next = req.status();

    Authentication auth = CurrentUser.requireAuth();
    RoleName role = extractRole(auth);

    boolean isAdmin = role == RoleName.ADMIN;
    boolean isAssignedTech = role == RoleName.TECHNICIAN && 
                             ticket.getAssignedTechnician() != null && 
                             ticket.getAssignedTechnician().getId().equals(CurrentUser.id());

    if (!isAdmin && !isAssignedTech) {
      throw new ForbiddenException("Not allowed to update ticket status");
    }

    if (next == current) {
      return toTicketResponse(ticket, true);
    }

    // Workflow: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
    if (next == TicketStatus.IN_PROGRESS) {
      if (current != TicketStatus.OPEN) {
        throw new ConflictException("Can only start work on OPEN tickets");
      }
    } else if (next == TicketStatus.RESOLVED) {
      if (current != TicketStatus.IN_PROGRESS) {
        throw new ConflictException("Tickets must be IN_PROGRESS before they can be RESOLVED");
      }
      if (req.resolutionNotes() == null || req.resolutionNotes().isBlank()) {
        throw new ConflictException("Resolution notes are required when resolving a ticket");
      }
      ticket.setResolutionNotes(req.resolutionNotes());
    } else if (next == TicketStatus.CLOSED) {
      if (!isAdmin) throw new ForbiddenException("Only admins can close tickets");
      if (current != TicketStatus.RESOLVED) {
        throw new ConflictException("Tickets must be RESOLVED before they can be CLOSED");
      }
      ticket.setClosedAt(java.time.Instant.now());
    } else if (next == TicketStatus.REJECTED) {
      if (!isAdmin) throw new ForbiddenException("Only admins can reject tickets");
      if (current != TicketStatus.OPEN && current != TicketStatus.IN_PROGRESS) {
        throw new ConflictException("Tickets can only be REJECTED while OPEN or IN_PROGRESS");
      }
      if (req.rejectionReason() == null || req.rejectionReason().isBlank()) {
        throw new ConflictException("Rejection reason is required when rejecting a ticket");
      }
      ticket.setRejectionReason(req.rejectionReason());
    } else {
      throw new ConflictException("Invalid status transition: " + current + " -> " + next);
    }

    ticket.setStatus(next);
    ticket.setUpdatedAt(java.time.Instant.now());
    ticket = ticketRepository.save(ticket);

    notificationService.send(
        ticket.getCreatedBy().getId(),
        com.smartcampus.enums.NotificationType.TICKET_STATUS_CHANGED,
        "Ticket updated",
        "Ticket " + ticket.getTicketNumber() + " is now " + next,
        "TICKET",
        ticket.getId());

    return toTicketResponse(ticket, true);
  }

  @Override
  public TicketResponse assignTechnician(String id, TicketAssignTechnicianRequest req) {
    ensureAdmin();
    var ticket = ticketRepository.findById(id).orElseThrow(() -> new NotFoundException("Ticket not found"));
    var tech = userRepository.findById(req.technicianUserId())
        .orElseThrow(() -> new NotFoundException("Technician not found"));
    if (tech.getRole() == null || tech.getRole().getName() != RoleName.TECHNICIAN) {
      throw new ConflictException("User is not a TECHNICIAN");
    }
    ticket.setAssignedTechnician(tech);
    ticket = ticketRepository.save(ticket);

    notificationService.send(
        tech.getId(),
        com.smartcampus.enums.NotificationType.TICKET_ASSIGNED,
        "Ticket assigned",
        "You were assigned ticket " + ticket.getTicketNumber(),
        "TICKET",
        ticket.getId());

    notificationService.send(
        ticket.getCreatedBy().getId(),
        com.smartcampus.enums.NotificationType.TICKET_ASSIGNED,
        "Technician Assigned",
        "Technician " + tech.getFullName() + " has been assigned to your ticket " + ticket.getTicketNumber(),
        "TICKET",
        ticket.getId());

    return toTicketResponse(ticket, true);
  }

  @Override
  public List<TicketAttachmentResponse> uploadAttachments(String id, MultipartFile[] files) {
    var ticket = ticketRepository.findById(id).orElseThrow(() -> new NotFoundException("Ticket not found"));
    enforceTicketAccess(ticket);

    if (files == null || files.length == 0) {
      throw new ConflictException("No files provided");
    }

    long current = attachmentRepository.countByTicketId(id);
    if (current + files.length > 3) {
      throw new ConflictException("Maximum 3 attachments allowed per ticket");
    }

    var uploader = userRepository.findById(CurrentUser.id()).orElseThrow(() -> new NotFoundException("User not found"));

    for (MultipartFile f : files) {
      var stored = fileStorageService.storeTicketImage(id, f);
      var a = new TicketAttachment();
      a.setTicket(ticket);
      a.setOriginalFileName(stored.originalFileName());
      a.setStoredFileName(stored.storedFileName());
      a.setContentType(stored.contentType());
      a.setSizeBytes(stored.sizeBytes());
      a.setStoragePath(stored.storagePath());
      a.setUploadedBy(uploader);
      attachmentRepository.save(a);
    }

    return attachmentRepository.findAllByTicketId(id).stream().map(ticketMapper::toAttachmentResponse).toList();
  }

  @Override
  public TicketCommentResponse addComment(String id, TicketCommentCreateRequest req) {
    var ticket = ticketRepository.findById(id).orElseThrow(() -> new NotFoundException("Ticket not found"));
    enforceTicketAccess(ticket);

    var author = userRepository.findById(CurrentUser.id()).orElseThrow(() -> new NotFoundException("User not found"));
    var c = new TicketComment();
    c.setTicket(ticket);
    c.setAuthor(author);
    c.setBody(req.body());
    c.setEdited(false);
    c = commentRepository.save(c);

    String recipientId = author.getId().equals(ticket.getCreatedBy().getId())
        ? (ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getId() : null)
        : ticket.getCreatedBy().getId();

    if (recipientId != null) {
      notificationService.send(
          recipientId,
          com.smartcampus.enums.NotificationType.TICKET_NEW_COMMENT,
          "New comment",
          "New comment on ticket " + ticket.getTicketNumber() + " by " + author.getFullName(),
          "TICKET",
          ticket.getId());
    }

    return ticketMapper.toCommentResponse(c);
  }

  @Override
  public TicketCommentResponse updateComment(String commentId, TicketCommentUpdateRequest req) {
    var c = commentRepository.findById(commentId).orElseThrow(() -> new NotFoundException("Comment not found"));
    boolean isAdmin = isAdmin(CurrentUser.requireAuth());
    if (!isAdmin && !c.getAuthor().getId().equals(CurrentUser.id())) {
      throw new NotFoundException("Comment not found");
    }
    c.setBody(req.body());
    c.setEdited(true);
    c = commentRepository.save(c);
    return ticketMapper.toCommentResponse(c);
  }

  @Override
  public void deleteComment(String commentId) {
    var c = commentRepository.findById(commentId).orElseThrow(() -> new NotFoundException("Comment not found"));
    boolean isAdmin = isAdmin(CurrentUser.requireAuth());
    if (!isAdmin && !c.getAuthor().getId().equals(CurrentUser.id())) {
      throw new NotFoundException("Comment not found");
    }
    commentRepository.delete(c);
  }

  private TicketResponse toTicketResponse(Ticket ticket, boolean includeDetails) {
    try {
      List<TicketAttachmentResponse> attachments = List.of();
      List<TicketCommentResponse> comments = List.of();

      if (includeDetails) {
        attachments = attachmentRepository.findAllByTicketId(ticket.getId()).stream()
            .map(a -> {
              try { return ticketMapper.toAttachmentResponse(a); }
              catch (Exception e) { log.error("Failing to map attachment: {}", a.getId()); return null; }
            })
            .filter(java.util.Objects::nonNull)
            .toList();

        comments = commentRepository.findAllByTicketIdOrderByCreatedAtAsc(ticket.getId()).stream()
            .map(c -> {
              try { return ticketMapper.toCommentResponse(c); }
              catch (Exception e) { log.error("Failing to map comment: {}", c.getId()); return null; }
            })
            .filter(java.util.Objects::nonNull)
            .toList();
      }

      java.time.Instant targetResolutionTime = null;
      String slaStatus = "ON_TRACK";
      
      if (ticket.getPriority() != null && ticket.getCreatedAt() != null) {
        long hours = switch (ticket.getPriority()) {
          case LOW -> 168; // 7 days
          case MEDIUM -> 72; // 3 days
          case HIGH -> 24;
          case URGENT, CRITICAL, EMERGENCY -> 4;
          default -> 72;
        };
        targetResolutionTime = ticket.getCreatedAt().plus(hours, java.time.temporal.ChronoUnit.HOURS);
        
        if (ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED) {
           java.time.Instant resolvedAt = ticket.getUpdatedAt();
           if (resolvedAt != null && resolvedAt.isAfter(targetResolutionTime)) {
               slaStatus = "RESOLVED_LATE";
           } else {
               slaStatus = "RESOLVED_ON_TIME";
           }
        } else if (ticket.getStatus() == TicketStatus.REJECTED) {
           slaStatus = "REJECTED";
        } else {
           if (java.time.Instant.now().isAfter(targetResolutionTime)) {
               slaStatus = "OVERDUE";
           }
        }
      }

      // Safe property access for @DocumentReference relations
      String resId = null;
      try { resId = ticket.getResource() != null ? ticket.getResource().getId() : null; } catch (Exception e) { log.warn("Broken resource ref for ticket: {}", ticket.getTicketNumber()); }

      String creatorId = null;
      String creatorEmail = null;
      String creatorName = null;
      try { 
        if (ticket.getCreatedBy() != null) {
          creatorId = ticket.getCreatedBy().getId();
          creatorEmail = ticket.getCreatedBy().getEmail();
          creatorName = ticket.getCreatedBy().getFullName();
        }
      } catch (Exception e) { log.warn("Broken creator ref for ticket: {}", ticket.getTicketNumber()); }

      String techId = null;
      String techEmail = null;
      String techName = null;
      try {
        if (ticket.getAssignedTechnician() != null) {
          techId = ticket.getAssignedTechnician().getId();
          techEmail = ticket.getAssignedTechnician().getEmail();
          techName = ticket.getAssignedTechnician().getFullName();
        }
      } catch (Exception e) { log.warn("Broken technician ref for ticket: {}", ticket.getTicketNumber()); }

      return new TicketResponse(
          ticket.getId(),
          ticket.getTicketNumber(),
          ticket.getTitle(),
          resId,
          ticket.getLocationText(),
          ticket.getCategory(),
          ticket.getPriority(),
          ticket.getDescription(),
          ticket.getPreferredContact(),
          ticket.getStatus(),
          creatorId,
          creatorEmail,
          creatorName,
          techId,
          techEmail,
          techName,
          ticket.getResolutionNotes(),
          ticket.getRejectionReason(),
          ticket.getCreatedAt(),
          ticket.getUpdatedAt(),
          ticket.getClosedAt(),
          targetResolutionTime,
          slaStatus,
          attachments,
          comments);
    } catch (Exception e) {
      log.error("CRITICAL: Failed to convert ticket {} to response", ticket.getTicketNumber(), e);
      // Fallback: minimal response to prevent 500 error for whole list
      return new TicketResponse(ticket.getId(), ticket.getTicketNumber(), ticket.getTitle(), null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "ERROR", List.of(), List.of());
    }
  }

  private void enforceTicketAccess(Ticket ticket) {
    Authentication auth = CurrentUser.requireAuth();
    RoleName role = extractRole(auth);
    if (role == RoleName.ADMIN)
      return;
    if (role == RoleName.USER && ticket.getCreatedBy().getId().equals(CurrentUser.id()))
      return;
    if (role == RoleName.TECHNICIAN && ticket.getAssignedTechnician() != null
        && ticket.getAssignedTechnician().getId().equals(CurrentUser.id()))
      return;
    throw new NotFoundException("Ticket not found");
  }

  private RoleName extractRole(Authentication auth) {
    if (auth.getPrincipal() instanceof AppUserPrincipal p) {
      return p.getRole();
    }

    var authorities = auth.getAuthorities();
    if (authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
      return RoleName.ADMIN;
    }
    if (authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_TECHNICIAN"))) {
      return RoleName.TECHNICIAN;
    }

    return RoleName.USER;
  }

  private boolean isAdmin(Authentication auth) {
    return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
  }

  private void ensureAdmin() {
    if (!isAdmin(CurrentUser.requireAuth()))
      throw new ForbiddenException("Admin privileges required");
  }

  private String generateTicketNumber() {
    return "TCK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
  }

  @Override
  public java.nio.file.Path getAttachmentPath(String ticketId, String attachmentId) {
    var a = attachmentRepository.findById(attachmentId)
        .orElseThrow(() -> new NotFoundException("Attachment not found"));
    if (a.getTicket() == null || !a.getTicket().getId().equals(ticketId)) {
      throw new NotFoundException("Attachment not found");
    }
    enforceTicketAccess(a.getTicket());
    return java.nio.file.Paths.get(a.getStoragePath());
  }
}
