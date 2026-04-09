package com.smartcampus.service;

import com.smartcampus.dto.request.BookingCreateRequest;
import com.smartcampus.dto.request.BookingDecisionRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.enums.BookingStatus;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookingService {
  BookingResponse create(BookingCreateRequest req);

  BookingResponse update(String id, BookingCreateRequest req);

  Page<BookingResponse> list(String q, BookingStatus status, String resourceId, LocalDate from, LocalDate to,
      String chronology, Pageable pageable);

  BookingResponse get(String id);

  BookingResponse approve(String id, BookingDecisionRequest req);

  BookingResponse reject(String id, BookingDecisionRequest req);

  BookingResponse cancel(String id);
}

