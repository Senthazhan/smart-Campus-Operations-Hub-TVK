package com.smartcampus.service;

import com.smartcampus.dto.request.ResourceCreateRequest;
import com.smartcampus.dto.request.ResourceUpdateRequest;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ResourceService {
  Page<ResourceResponse> search(
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
  );

  ResourceResponse getById(String id);

  ResourceResponse create(ResourceCreateRequest req);

  ResourceResponse update(String id, ResourceUpdateRequest req);

  void delete(String id);
}

