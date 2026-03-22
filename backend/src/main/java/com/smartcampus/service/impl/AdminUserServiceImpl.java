package com.smartcampus.service.impl;

import com.smartcampus.dto.request.UpdateUserRoleRequest;
import com.smartcampus.dto.response.AdminUserResponse;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.NotFoundException;
import com.smartcampus.mapper.UserMapper;
import com.smartcampus.repository.RoleRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.AdminUserService;
import com.smartcampus.enums.RoleName;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final UserMapper userMapper;
  private final PasswordEncoder passwordEncoder;

  @Override
  @Transactional(readOnly = true)
  public Page<AdminUserResponse> list(String query, com.smartcampus.enums.RoleName roleName, Pageable pageable) {
    if (roleName != null) {
      var role = roleRepository.findByName(roleName)
          .orElseThrow(() -> new NotFoundException("Role not found"));
      
      if (query != null && !query.isBlank()) {
        return userRepository.searchWithRole(role, query, query, query, pageable)
            .map(userMapper::toAdminUserResponse);
      }
      return userRepository.findByRole(role, pageable).map(userMapper::toAdminUserResponse);
    }

    if (query != null && !query.isBlank()) {
      return userRepository.search(query, query, query, pageable)
          .map(userMapper::toAdminUserResponse);
    }
    return userRepository.findAll(pageable).map(userMapper::toAdminUserResponse);
  }

  @Override
  @Transactional
  public AdminUserResponse updateRole(String userId, UpdateUserRoleRequest req) {
    var user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
    var role = roleRepository.findByName(req.role()).orElseThrow(() -> new ConflictException("Role not found"));
    user.setRole(role);
    user = userRepository.save(user);
    return userMapper.toAdminUserResponse(user);
  }

  @Override
  @Transactional
  public AdminUserResponse updateProfile(String userId, com.smartcampus.dto.request.AdminUserUpdateRequest req) {
    var user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
    user.setFullName(req.fullName());
    user.setPhone(req.phone());
    user.setDepartment(req.department());
    user.setStatus(req.status());
    user.setLanguage(req.language());
    user.setTimezone(req.timezone());
    user = userRepository.save(user);
    return userMapper.toAdminUserResponse(user);
  }

  @Override
  @Transactional
  public AdminUserResponse toggleStatus(String userId) {
    var user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
    user.setStatus("ACTIVE".equals(user.getStatus()) ? "INACTIVE" : "ACTIVE");
    user = userRepository.save(user);
    return userMapper.toAdminUserResponse(user);
  }

  @Override
  @Transactional
  public AdminUserResponse create(com.smartcampus.dto.request.AdminUserCreateRequest req) {
    if (userRepository.existsByUsername(req.username())) {
      throw new ConflictException("Username is already taken!");
    }
    if (userRepository.existsByEmail(req.email())) {
      throw new ConflictException("Email is already in use!");
    }

    var user = new com.smartcampus.entity.User();
    user.setUsername(req.username());
    user.setEmail(req.email());
    user.setPassword(passwordEncoder.encode(req.password()));
    user.setFullName(req.fullName());
    user.setPhone(req.phone());
    user.setDepartment(req.department());
    user.setStatus(req.status() != null ? req.status() : "ACTIVE");

    RoleName roleName = RoleName.USER;
    try {
      if (req.role() != null) roleName = RoleName.valueOf(req.role());
    } catch (IllegalArgumentException ignored) {}

    var role = roleRepository.findByName(roleName)
        .orElseThrow(() -> new ConflictException("Role not found"));
    
    user.setRole(role);
    user = userRepository.save(user);
    return userMapper.toAdminUserResponse(user);
  }

  @Override
  @Transactional
  public void delete(String userId) {
    System.out.println("DEBUG: Service deleting user: " + userId);
    if (!userRepository.existsById(userId)) {
      System.err.println("DEBUG: User not found: " + userId);
      throw new NotFoundException("User not found");
    }
    userRepository.deleteById(userId);
    System.out.println("DEBUG: User deleted from repo: " + userId);
  }
}

