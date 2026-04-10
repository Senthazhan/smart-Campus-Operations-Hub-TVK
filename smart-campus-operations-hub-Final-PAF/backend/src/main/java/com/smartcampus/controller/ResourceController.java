package com.smartcampus.controller;

import com.smartcampus.dto.request.ResourceCreateRequest;
import com.smartcampus.dto.request.ResourceUpdateRequest;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.dto.response.ResourceTimeFitPreviewResponse;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.service.ResourceService;
import com.smartcampus.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
public class ResourceController {

  private final ResourceService resourceService;

  @GetMapping
  public ResponseEntity<ApiResponse<Page<ResourceResponse>>> search(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) ResourceType type,
      @RequestParam(required = false) ResourceStatus status,
      @RequestParam(required = false) String building,
      @RequestParam(required = false) Integer minCapacity,
      @RequestParam(required = false) LocalDate bookingDate,
      @RequestParam(required = false) LocalTime startTime,
      @RequestParam(required = false) LocalTime endTime,
      @RequestParam(required = false) String excludeBookingId,
      @PageableDefault(size = 10) Pageable pageable,
      HttpServletRequest req
  ) {
    return ResponseEntity.ok(ApiResponse.ok(
        req.getRequestURI(),
        resourceService.search(
            q, type, status, building, minCapacity, bookingDate, startTime, endTime, excludeBookingId, pageable)));
  }

  @GetMapping("/time-fit-preview")
  public ResponseEntity<ApiResponse<Page<ResourceTimeFitPreviewResponse>>> previewTimeFit(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) ResourceType type,
      @RequestParam(required = false) ResourceStatus status,
      @RequestParam(required = false) String building,
      @RequestParam(required = false) Integer minCapacity,
      @RequestParam(required = false) LocalDate bookingDate,
      @RequestParam(required = false) LocalTime startTime,
      @RequestParam(required = false) LocalTime endTime,
      @RequestParam(required = false) String excludeBookingId,
      @PageableDefault(size = 10) Pageable pageable,
      HttpServletRequest req
  ) {
    return ResponseEntity.ok(ApiResponse.ok(
        req.getRequestURI(),
        resourceService.previewTimeFit(
            q, type, status, building, minCapacity, bookingDate, startTime, endTime, excludeBookingId, pageable)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<ResourceResponse>> get(@PathVariable String id, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), resourceService.getById(id)));
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<ResourceResponse>> create(@Valid @RequestBody ResourceCreateRequest body, HttpServletRequest req) {
    var created = resourceService.create(body);
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(req.getRequestURI(), created));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<ResourceResponse>> update(@PathVariable String id, @Valid @RequestBody ResourceUpdateRequest body, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), resourceService.update(id, body)));
  }

  @PostMapping("/{id}/image")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<ResourceResponse>> uploadImage(
      @PathVariable String id,
      @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
      HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), resourceService.uploadImage(id, file)));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    resourceService.delete(id);
    return ResponseEntity.noContent().build();
  }
}

