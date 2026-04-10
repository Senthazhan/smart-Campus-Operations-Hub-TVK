package com.smartcampus.controller;

import com.smartcampus.dto.request.BookingCreateRequest;
import com.smartcampus.dto.request.BookingDecisionRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.service.BookingService;
import com.smartcampus.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

  private final BookingService bookingService;

  @PostMapping
  public ResponseEntity<ApiResponse<BookingResponse>> create(@Valid @RequestBody BookingCreateRequest body, HttpServletRequest req) {
    var created = bookingService.create(body);
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(req.getRequestURI(), created));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<BookingResponse>> update(@PathVariable String id, @Valid @RequestBody BookingCreateRequest body, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), bookingService.update(id, body)));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Page<BookingResponse>>> list(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) BookingStatus status,
      @RequestParam(required = false) BookingStatus excludeStatus,
      @RequestParam(required = false) String resourceId,
      @RequestParam(required = false) LocalDate from,
      @RequestParam(required = false) LocalDate to,
      @RequestParam(required = false, defaultValue = "latest") String chronology,
      @PageableDefault(size = 10) Pageable pageable,
      HttpServletRequest req
  ) {
    return ResponseEntity.ok(
        ApiResponse.ok(req.getRequestURI(), bookingService.list(q, status, resourceId, from, to, excludeStatus, chronology, pageable)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<BookingResponse>> get(@PathVariable String id, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), bookingService.get(id)));
  }

  @PatchMapping("/{id}/approve")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<BookingResponse>> approve(@PathVariable String id, @Valid @RequestBody BookingDecisionRequest body, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), bookingService.approve(id, body)));
  }

  @PatchMapping("/{id}/reject")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<BookingResponse>> reject(@PathVariable String id, @Valid @RequestBody BookingDecisionRequest body, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), bookingService.reject(id, body)));
  }

  @PatchMapping("/{id}/cancel")
  public ResponseEntity<ApiResponse<BookingResponse>> cancel(@PathVariable String id, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), bookingService.cancel(id)));
  }
}
