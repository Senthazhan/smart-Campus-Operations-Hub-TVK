package com.smartcampus.controller;

import com.smartcampus.dto.response.AdminAnalyticsResponse;
import com.smartcampus.dto.response.UserAnalyticsResponse;
import com.smartcampus.service.AnalyticsService;
import com.smartcampus.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

  private final AnalyticsService analyticsService;

  @GetMapping("/admin")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<AdminAnalyticsResponse>> admin(
      HttpServletRequest req,
      @RequestParam(defaultValue = "7") int days
  ) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), analyticsService.getAdminAnalytics(days)));
  }

  @GetMapping("/me")
  public ResponseEntity<ApiResponse<UserAnalyticsResponse>> me(HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), analyticsService.getUserAnalytics()));
  }
}

