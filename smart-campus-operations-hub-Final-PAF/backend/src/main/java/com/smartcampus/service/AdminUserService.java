package com.smartcampus.service;

import com.smartcampus.dto.request.UpdateUserRoleRequest;
import com.smartcampus.dto.response.AdminUserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminUserService {
  Page<AdminUserResponse> list(String query, com.smartcampus.enums.RoleName role, Pageable pageable);

  AdminUserResponse updateRole(String userId, UpdateUserRoleRequest req);

  AdminUserResponse updateProfile(String userId, com.smartcampus.dto.request.AdminUserUpdateRequest req);

  AdminUserResponse toggleStatus(String userId);

  AdminUserResponse create(com.smartcampus.dto.request.AdminUserCreateRequest req);
  void delete(String userId);
}

