package com.smartcampus.controller;

import com.smartcampus.dto.request.UpdateUserRoleRequest;
import com.smartcampus.dto.response.AdminUserResponse;
import com.smartcampus.service.AdminUserService;
import com.smartcampus.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

  private final AdminUserService adminUserService;

  @GetMapping
  public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> list(
      @RequestParam(value = "query", required = false) String query,
      @RequestParam(value = "role", required = false) com.smartcampus.enums.RoleName role,
      @PageableDefault(size = 10) Pageable pageable, 
      HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), adminUserService.list(query, role, pageable)));
  }

  @PatchMapping("/{id}/role")
  public ResponseEntity<ApiResponse<AdminUserResponse>> updateRole(@PathVariable("id") String id, @Valid @RequestBody UpdateUserRoleRequest body, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), adminUserService.updateRole(id, body)));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<ApiResponse<AdminUserResponse>> updateProfile(@PathVariable("id") String id, @Valid @RequestBody com.smartcampus.dto.request.AdminUserUpdateRequest body, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), adminUserService.updateProfile(id, body)));
  }

  @PatchMapping("/{id}/status")
  public ResponseEntity<ApiResponse<AdminUserResponse>> toggleStatus(@PathVariable("id") String id, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), adminUserService.toggleStatus(id)));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<AdminUserResponse>> create(@Valid @RequestBody com.smartcampus.dto.request.AdminUserCreateRequest body, HttpServletRequest req) {
    return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
        .body(ApiResponse.ok(req.getRequestURI(), adminUserService.create(body)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") String id, HttpServletRequest req) {
    System.out.println("DEBUG: Delete request for user ID: " + id);
    adminUserService.delete(id);
    System.out.println("DEBUG: Delete successful for user ID: " + id);
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), null));
  }
}

