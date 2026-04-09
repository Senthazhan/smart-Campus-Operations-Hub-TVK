package com.smartcampus.service.impl;

import com.smartcampus.dto.request.BookingCreateRequest;
import com.smartcampus.dto.request.BookingDecisionRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.entity.Booking;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.ForbiddenException;
import com.smartcampus.exception.NotFoundException;
import com.smartcampus.mapper.BookingMapper;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.service.BookingService;
import java.time.LocalDate;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.LookupOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.support.PageableExecutionUtils;
import org.bson.types.ObjectId;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

  private final BookingRepository bookingRepository;
  private final ResourceRepository resourceRepository;
  private final UserRepository userRepository;
  private final BookingMapper bookingMapper;
  private final MongoTemplate mongoTemplate;
  private final com.smartcampus.service.NotificationService notificationService;

  @Override
  public BookingResponse create(BookingCreateRequest req) {
    validateBookingRequest(req);

    var resource = resourceRepository.findById(req.resourceId())
        .orElseThrow(() -> new NotFoundException("Resource not found"));
    ensureResourceCanBeBooked(resource, req.expectedAttendees());
    ensureNoConflicts(resource.getId(), req.bookingDate(), req.startTime(), req.endTime(), null);

    var user = userRepository.findById(CurrentUser.id())
        .orElseThrow(() -> new NotFoundException("User not found"));

    var booking = new Booking();
    booking.setResource(resource);
    booking.setUser(user);
    booking.setBookingDate(req.bookingDate());
    booking.setStartTime(req.startTime());
    booking.setEndTime(req.endTime());
    booking.setPurpose(req.purpose());
    booking.setExpectedAttendees(req.expectedAttendees());
    booking.setNotes(req.notes());
    booking.setStatus(BookingStatus.PENDING);

    booking = bookingRepository.save(booking);

    notificationService.broadcastToAdmins(
        com.smartcampus.enums.NotificationType.BOOKING_SUBMITTED,
        "New Booking Request",
        "A new booking request for " + resource.getName() + " by " + user.getFullName() + " is pending approval.",
        "BOOKING",
        booking.getId());

    return bookingMapper.toResponse(booking);
  }

  @Override
  public BookingResponse update(String id, BookingCreateRequest req) {
    validateBookingRequest(req);

    var booking = bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found"));
    boolean isAdmin = CurrentUser.requireAuth().getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    boolean isOwner = booking.getUser().getId().equals(CurrentUser.id());
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException("Not allowed to edit this booking");
    }
    if (booking.getStatus() != BookingStatus.PENDING) {
      throw new ConflictException("Only PENDING bookings can be edited");
    }

    var resource = resourceRepository.findById(req.resourceId())
        .orElseThrow(() -> new NotFoundException("Resource not found"));
    ensureResourceCanBeBooked(resource, req.expectedAttendees());
    ensureNoConflictsForUpdate(booking, resource.getId(), req.bookingDate(), req.startTime(), req.endTime());

    booking.setResource(resource);
    booking.setBookingDate(req.bookingDate());
    booking.setStartTime(req.startTime());
    booking.setEndTime(req.endTime());
    booking.setPurpose(req.purpose());
    booking.setExpectedAttendees(req.expectedAttendees());
    booking.setNotes(req.notes());
    booking.setUpdatedAt(Instant.now());

    booking = bookingRepository.save(booking);
    return bookingMapper.toResponse(booking);
  }

  @Override
  public Page<BookingResponse> list(String q, BookingStatus status, String resourceId, LocalDate from, LocalDate to,
      Pageable pageable) {
    Authentication auth = CurrentUser.requireAuth();
    boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

    List<AggregationOperation> ops = new ArrayList<>();

    // Initial match for basic filters on Booking
    List<Criteria> bookingCriteria = new ArrayList<>();
    if (status != null)
      bookingCriteria.add(Criteria.where("status").is(status));
    if (resourceId != null) {
      if (ObjectId.isValid(resourceId))
        bookingCriteria.add(Criteria.where("resource").is(new ObjectId(resourceId)));
      else
        bookingCriteria.add(Criteria.where("resource").is(resourceId));
    }
    if (from != null)
      bookingCriteria.add(Criteria.where("bookingDate").gte(from));
    if (to != null)
      bookingCriteria.add(Criteria.where("bookingDate").lte(to));
    if (!isAdmin) {
      String userId = CurrentUser.id();
      if (ObjectId.isValid(userId)) {
        bookingCriteria.add(Criteria.where("user").is(new ObjectId(userId)));
      } else {
        bookingCriteria.add(Criteria.where("user").is(userId));
      }
    }

    if (!bookingCriteria.isEmpty()) {
      ops.add(Aggregation.match(new Criteria().andOperator(bookingCriteria.toArray(new Criteria[0]))));
    }

    // Lookup Resource and User for search functionality
    ops.add(LookupOperation.newLookup().from("resources").localField("resource").foreignField("_id")
        .as("resource_details"));
    ops.add(LookupOperation.newLookup().from("users").localField("user").foreignField("_id")
        .as("user_details"));

    // Add q search criteria
    if (q != null && !q.isBlank()) {
      String regex = q;
      ops.add(Aggregation.match(new Criteria().orOperator(
          Criteria.where("purpose").regex(regex, "i"),
          Criteria.where("resource_details.name").regex(regex, "i"),
          Criteria.where("resource_details.resourceCode").regex(regex, "i"),
          Criteria.where("user_details.email").regex(regex, "i"))));
    }

    // Pagination
    ops.add(Aggregation.skip((long) pageable.getOffset()));
    ops.add(Aggregation.limit(pageable.getPageSize()));

    List<Booking> results = mongoTemplate.aggregate(Aggregation.newAggregation(ops), Booking.class, Booking.class)
        .getMappedResults();

    // Count for pagination (using a simpler aggregation)
    List<AggregationOperation> countOps = new ArrayList<>();
    if (!bookingCriteria.isEmpty())
      countOps.add(Aggregation.match(new Criteria().andOperator(bookingCriteria.toArray(new Criteria[0]))));
    countOps.add(LookupOperation.newLookup().from("resources").localField("resource").foreignField("_id")
        .as("resource_details"));
    countOps.add(LookupOperation.newLookup().from("users").localField("user").foreignField("_id")
        .as("user_details"));
    if (q != null && !q.isBlank()) {
      countOps.add(Aggregation.match(new Criteria().orOperator(
          Criteria.where("purpose").regex(q, "i"),
          Criteria.where("resource_details.name").regex(q, "i"),
          Criteria.where("resource_details.resourceCode").regex(q, "i"),
          Criteria.where("user_details.email").regex(q, "i"))));
    }
    countOps.add(Aggregation.count().as("totalCount"));

    long total = 0;
    var countResult = mongoTemplate
        .aggregate(Aggregation.newAggregation(countOps), Booking.class, org.bson.Document.class)
        .getUniqueMappedResult();
    if (countResult != null && countResult.containsKey("totalCount")) {
      total = ((Number) countResult.get("totalCount")).longValue();
    }
    final long finalTotal = total;
    return PageableExecutionUtils.getPage(results, pageable, () -> finalTotal).map(bookingMapper::toResponse);
  }

  @Override
  public BookingResponse get(String id) {
    var booking = bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found"));
    enforceOwnerOrAdmin(booking);
    return bookingMapper.toResponse(booking);
  }

  @Override
  public BookingResponse approve(String id, BookingDecisionRequest req) {
    var booking = bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found"));
    ensureAdmin();
    if (booking.getStatus() != BookingStatus.PENDING) {
      throw new ConflictException("Only PENDING bookings can be approved");
    }

    long conflicts = countConflicts(
        booking.getResource().getId(),
        booking.getBookingDate(),
        booking.getStartTime(),
        booking.getEndTime(),
        List.of(BookingStatus.APPROVED),
        null);
    if (conflicts > 0) {
      throw new ConflictException("Cannot approve due to an existing approved booking conflict");
    }

    var admin = userRepository.findById(CurrentUser.id())
        .orElseThrow(() -> new NotFoundException("User not found"));

    booking.setStatus(BookingStatus.APPROVED);
    booking.setDecisionReason(req.reason());
    booking.setDecidedBy(admin);
    booking.setDecidedAt(Instant.now());
    booking = bookingRepository.save(booking);

    notificationService.send(
        booking.getUser().getId(),
        com.smartcampus.enums.NotificationType.BOOKING_APPROVED,
        "Booking Approved",
        "Your booking for " + booking.getResource().getName() + " has been approved.",
        "BOOKING",
        booking.getId());

    return bookingMapper.toResponse(booking);
  }

  @Override
  public BookingResponse reject(String id, BookingDecisionRequest req) {
    var booking = bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found"));
    ensureAdmin();
    if (booking.getStatus() != BookingStatus.PENDING) {
      throw new ConflictException("Only PENDING bookings can be rejected");
    }

    var admin = userRepository.findById(CurrentUser.id())
        .orElseThrow(() -> new NotFoundException("User not found"));

    booking.setStatus(BookingStatus.REJECTED);
    booking.setDecisionReason(req.reason());
    booking.setDecidedBy(admin);
    booking.setDecidedAt(Instant.now());
    booking = bookingRepository.save(booking);

    notificationService.send(
        booking.getUser().getId(),
        com.smartcampus.enums.NotificationType.BOOKING_REJECTED,
        "Booking Rejected",
        "Your booking for " + booking.getResource().getName() + " has been rejected: " + req.reason(),
        "BOOKING",
        booking.getId());

    return bookingMapper.toResponse(booking);
  }

  @Override
  public BookingResponse cancel(String id) {
    var booking = bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found"));
    boolean isAdmin = CurrentUser.requireAuth().getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    boolean isOwner = booking.getUser().getId().equals(CurrentUser.id());
    if (!isAdmin && !isOwner)
      throw new ForbiddenException("Not allowed to cancel this booking");

    if (booking.getStatus() == BookingStatus.CANCELLED) {
      return bookingMapper.toResponse(booking);
    }
    if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
      throw new ConflictException("Only PENDING or APPROVED bookings can be cancelled");
    }

    booking.setStatus(BookingStatus.CANCELLED);
    booking = bookingRepository.save(booking);

    if (isOwner) {
      notificationService.broadcastToAdmins(
          com.smartcampus.enums.NotificationType.BOOKING_CANCELLED,
          "Booking Cancelled",
          "A booking for " + booking.getResource().getName() + " by " + booking.getUser().getFullName() + " was cancelled by the user.",
          "BOOKING",
          booking.getId());
    }

    return bookingMapper.toResponse(booking);
  }

  private void enforceOwnerOrAdmin(Booking booking) {
    boolean isAdmin = CurrentUser.requireAuth().getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    if (isAdmin)
      return;
    if (!booking.getUser().getId().equals(CurrentUser.id())) {
      throw new NotFoundException("Booking not found");
    }
  }

  private void ensureAdmin() {
    boolean isAdmin = CurrentUser.requireAuth().getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    if (!isAdmin)
      throw new ForbiddenException("Admin privileges required");
  }

  private void validateBookingRequest(BookingCreateRequest req) {
    if (!req.startTime().isBefore(req.endTime())) {
      throw new ConflictException("Start time must be before end time");
    }
  }

  private void ensureResourceCanBeBooked(com.smartcampus.entity.Resource resource, int expectedAttendees) {
    if (resource.getStatus() != ResourceStatus.ACTIVE) {
      throw new ConflictException("Resource is not available for booking");
    }
    if (resource.getCapacity() > 0 && expectedAttendees > resource.getCapacity()) {
      throw new ConflictException("Expected attendees exceed resource capacity");
    }
  }

  private void ensureNoConflicts(String resourceId, LocalDate bookingDate, java.time.LocalTime startTime,
      java.time.LocalTime endTime, String excludeBookingId) {
    long conflicts = countConflicts(resourceId, bookingDate, startTime, endTime,
        List.of(BookingStatus.APPROVED, BookingStatus.PENDING), excludeBookingId);
    if (conflicts > 0) {
      throw new ConflictException("Booking conflict for the selected time window");
    }
  }

  private void ensureNoConflictsForUpdate(Booking booking, String resourceId, LocalDate bookingDate,
      java.time.LocalTime startTime, java.time.LocalTime endTime) {
    long conflicts = countConflicts(resourceId, bookingDate, startTime, endTime,
        List.of(BookingStatus.APPROVED, BookingStatus.PENDING), booking.getId());

    boolean currentBookingWouldMatch = booking.getResource().getId().equals(resourceId)
        && booking.getBookingDate().equals(bookingDate)
        && booking.getStartTime().isBefore(endTime)
        && booking.getEndTime().isAfter(startTime);

    if (currentBookingWouldMatch) {
      conflicts = Math.max(0, conflicts - 1);
    }

    if (conflicts > 0) {
      throw new ConflictException("Booking conflict for the selected time window");
    }
  }

  private long countConflicts(String resourceId, LocalDate bookingDate, java.time.LocalTime startTime,
      java.time.LocalTime endTime, List<BookingStatus> statuses, String excludeBookingId) {
    return bookingRepository.findAllByBookingDateAndStatusIn(bookingDate, statuses).stream()
        .filter(existing -> excludeBookingId == null || !excludeBookingId.equals(existing.getId()))
        .filter(existing -> existing.getResource() != null && resourceId.equals(existing.getResource().getId()))
        .filter(existing -> existing.getStartTime().isBefore(endTime) && existing.getEndTime().isAfter(startTime))
        .count();
  }
}
