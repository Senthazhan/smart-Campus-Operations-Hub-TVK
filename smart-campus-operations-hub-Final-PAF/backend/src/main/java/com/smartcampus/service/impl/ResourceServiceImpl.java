package com.smartcampus.service.impl;

import com.smartcampus.dto.request.ResourceCreateRequest;
import com.smartcampus.dto.request.ResourceUpdateRequest;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.entity.Resource;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.NotFoundException;
import com.smartcampus.mapper.ResourceMapper;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.util.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements com.smartcampus.service.ResourceService {

  private final ResourceRepository resourceRepository;
  private final ResourceMapper resourceMapper;
  private final MongoTemplate mongoTemplate;
  private final BookingRepository bookingRepository;
  private final FileStorageService fileStorageService;

  @Override
  public Page<ResourceResponse> search(
      String q,
      ResourceType type,
      ResourceStatus status,
      String building,
      Integer minCapacity,
      LocalDate bookingDate,
      LocalTime startTime,
      LocalTime endTime,
      String excludeBookingId,
      Pageable pageable
  ) {
    boolean hasAvailabilityWindow = bookingDate != null && startTime != null && endTime != null;
    Query query = new Query();
    if (!hasAvailabilityWindow) {
      query.with(pageable);
    }
    List<Criteria> criteriaList = new ArrayList<>();

    if (type != null) {
      criteriaList.add(Criteria.where("type").is(type));
    }
    if (status != null) {
      criteriaList.add(Criteria.where("status").is(status));
    }
    if (building != null && !building.isBlank()) {
      criteriaList.add(Criteria.where("building").regex(building, "i"));
    }
    if (minCapacity != null) {
      criteriaList.add(Criteria.where("capacity").gte(minCapacity));
    }
    if (q != null && !q.isBlank()) {
      criteriaList.add(new Criteria().orOperator(
          Criteria.where("name").regex(q, "i"),
          Criteria.where("resourceCode").regex(q, "i"),
          Criteria.where("building").regex(q, "i")
      ));
    }

    if (!criteriaList.isEmpty()) {
      query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
    }

    List<Resource> resources = mongoTemplate.find(query, Resource.class);

    if (hasAvailabilityWindow) {
      resources = resources.stream()
          .filter(resource -> isWithinAvailabilityWindow(resource, startTime, endTime))
          .filter(resource -> countConflicts(
              resource.getId(),
              bookingDate,
              startTime,
              endTime,
              List.of(BookingStatus.APPROVED, BookingStatus.PENDING),
              excludeBookingId) == 0)
          .toList();

      int startIndex = (int) pageable.getOffset();
      int endIndex = Math.min(startIndex + pageable.getPageSize(), resources.size());
      List<Resource> pagedResources = startIndex >= resources.size()
          ? List.of()
          : resources.subList(startIndex, endIndex);

      return new PageImpl<>(
          pagedResources.stream().map(resourceMapper::toResponse).toList(),
          pageable,
          resources.size());
    }

    return PageableExecutionUtils.getPage(
        resources,
        pageable,
        () -> mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Resource.class)
    ).map(resourceMapper::toResponse);
  }

  @Override
  public ResourceResponse getById(String id) {
    var resource = resourceRepository.findById(id).orElseThrow(() -> new NotFoundException("Resource not found"));
    return resourceMapper.toResponse(resource);
  }

  @Override
  public ResourceResponse create(ResourceCreateRequest req) {
    resourceRepository.findByResourceCode(req.resourceCode()).ifPresent(r -> {
      throw new ConflictException("Resource code already exists");
    });

    var entity = resourceMapper.toEntity(req);
    entity.setCreatedBy(CurrentUser.id());
    entity.setUpdatedBy(CurrentUser.id());
    entity = resourceRepository.save(entity);
    return resourceMapper.toResponse(entity);
  }

  @Override
  public ResourceResponse update(String id, ResourceUpdateRequest req) {
    var entity = resourceRepository.findById(id).orElseThrow(() -> new NotFoundException("Resource not found"));
    resourceRepository.findByResourceCode(req.resourceCode())
        .filter(other -> !other.getId().equals(id))
        .ifPresent(other -> { throw new ConflictException("Resource code already exists"); });

    resourceMapper.updateEntity(req, entity);
    entity.setUpdatedBy(CurrentUser.id());
    entity = resourceRepository.save(entity);
    return resourceMapper.toResponse(entity);
  }

  @Override
  public ResourceResponse uploadImage(String id, org.springframework.web.multipart.MultipartFile file) {
    var entity = resourceRepository.findById(id).orElseThrow(() -> new NotFoundException("Resource not found"));
    var storedFile = fileStorageService.storeResourceImage(entity.getId(), file);
    String imageUrl = "/api/v1/files/resources/" + entity.getId() + "/" + storedFile.storedFileName();
    entity.setImageUrl(imageUrl);
    entity.setUpdatedBy(CurrentUser.id());
    entity = resourceRepository.save(entity);
    return resourceMapper.toResponse(entity);
  }

  @Override
  public void delete(String id) {
    if (!resourceRepository.existsById(id)) {
      throw new NotFoundException("Resource not found");
    }
    resourceRepository.deleteById(id);
  }

  private long countConflicts(String resourceId, LocalDate bookingDate, LocalTime startTime, LocalTime endTime,
      List<BookingStatus> statuses, String excludeBookingId) {
    return bookingRepository.findAllByBookingDateAndStatusIn(bookingDate, statuses).stream()
        .filter(existing -> excludeBookingId == null || !excludeBookingId.equals(existing.getId()))
        .filter(existing -> !isExpiredPending(existing))
        .filter(existing -> existing.getResource() != null && resourceId.equals(existing.getResource().getId()))
        .filter(existing -> existing.getStartTime().isBefore(endTime) && existing.getEndTime().isAfter(startTime))
        .count();
  }

  private boolean isWithinAvailabilityWindow(Resource resource, LocalTime startTime, LocalTime endTime) {
    if (resource.getAvailableFrom() != null && startTime.isBefore(resource.getAvailableFrom())) {
      return false;
    }
    if (resource.getAvailableTo() != null && endTime.isAfter(resource.getAvailableTo())) {
      return false;
    }
    return true;
  }

  private boolean isExpiredPending(com.smartcampus.entity.Booking booking) {
    return booking.getStatus() == BookingStatus.PENDING
        && LocalDateTime.of(booking.getBookingDate(), booking.getEndTime()).isBefore(LocalDateTime.now());
  }
}

