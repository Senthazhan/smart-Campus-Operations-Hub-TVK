package com.smartcampus.controller;

import com.smartcampus.dto.response.NotificationResponse;
import com.smartcampus.dto.response.NotificationSummaryResponse;
import com.smartcampus.service.NotificationService;
import com.smartcampus.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

  private final NotificationService notificationService;

  @GetMapping
  public ResponseEntity<ApiResponse<Page<NotificationResponse>>> list(
      @RequestParam(required = false) Boolean read,
      @PageableDefault(size = 10) Pageable pageable,
      HttpServletRequest req
  ) {
    return ResponseEntity.ok(
        ApiResponse.ok(req.getRequestURI(), notificationService.list(pageable, read))
    );
  }

  @GetMapping("/summary")
  public ResponseEntity<ApiResponse<NotificationSummaryResponse>> summary(HttpServletRequest req) {
    return ResponseEntity.ok(
        ApiResponse.ok(req.getRequestURI(), notificationService.summary())
    );
  }

  @PatchMapping("/{id}/read")
  public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable String id, HttpServletRequest req) {
    notificationService.markRead(id);
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI()));
  }

  @PatchMapping("/read-all")
  public ResponseEntity<ApiResponse<Void>> markReadAll(HttpServletRequest req) {
    notificationService.markReadAll();
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI()));
  }
}