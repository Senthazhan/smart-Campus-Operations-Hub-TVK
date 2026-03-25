package com.smartcampus.controller;

import com.smartcampus.dto.ChangePasswordRequest;
import com.smartcampus.dto.request.ProfileUpdateRequest;
import com.smartcampus.dto.response.MeResponse;
import com.smartcampus.service.UserService;
import com.smartcampus.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

  private final UserService userService;

  @GetMapping("/me")
  public ResponseEntity<ApiResponse<MeResponse>> getCurrentUser(HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), userService.me()));
  }

  @PostMapping("/update")
  public ResponseEntity<ApiResponse<MeResponse>> updateProfile(
      @Valid @RequestBody ProfileUpdateRequest request,
      HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), userService.updateProfile(request)));
  }

  @PostMapping("/avatar")
  public ResponseEntity<ApiResponse<MeResponse>> updateAvatar(
      @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
      HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), userService.updateAvatar(file)));
  }

  @PostMapping("/change-password")
  public ResponseEntity<ApiResponse<String>> changePassword(
      @Valid @RequestBody ChangePasswordRequest request,
      HttpServletRequest req) {
    userService.changePassword(request.oldPassword(), request.newPassword());
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), "Password changed successfully"));
  }
}