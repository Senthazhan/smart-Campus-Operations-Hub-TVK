package com.smartcampus.service.impl;

import com.smartcampus.dto.request.ProfileUpdateRequest;
import com.smartcampus.dto.response.MeResponse;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.NotFoundException;
import com.smartcampus.mapper.UserMapper;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.service.UserService;
import com.smartcampus.util.FileStorageService;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final UserMapper userMapper;
  private final PasswordEncoder passwordEncoder;
  private final FileStorageService fileStorageService;

  private User getCurrentAuthenticatedUser() {
    String authId = null;
    String authUsername = null;

    try {
      authId = CurrentUser.id();
    } catch (Exception ignored) {
    }

    try {
      authUsername = CurrentUser.username();
    } catch (Exception ignored) {
    }

    if (authId != null && !authId.isBlank()) {
      var byId = userRepository.findById(authId);
      if (byId.isPresent()) {
        return byId.get();
      }

      var byUsername = userRepository.findByUsername(authId);
      if (byUsername.isPresent()) {
        return byUsername.get();
      }

      var byEmail = userRepository.findByEmail(authId);
      if (byEmail.isPresent()) {
        return byEmail.get();
      }

      var byUsernameOrEmail = userRepository.findByUsernameOrEmail(authId, authId);
      if (byUsernameOrEmail.isPresent()) {
        return byUsernameOrEmail.get();
      }
    }

    if (authUsername != null && !authUsername.isBlank()) {
      var byUsername = userRepository.findByUsername(authUsername);
      if (byUsername.isPresent()) {
        return byUsername.get();
      }

      var byEmail = userRepository.findByEmail(authUsername);
      if (byEmail.isPresent()) {
        return byEmail.get();
      }

      var byUsernameOrEmail = userRepository.findByUsernameOrEmail(authUsername, authUsername);
      if (byUsernameOrEmail.isPresent()) {
        return byUsernameOrEmail.get();
      }

      var byId = userRepository.findById(authUsername);
      if (byId.isPresent()) {
        return byId.get();
      }
    }

    throw new NotFoundException("Authenticated user could not be resolved.");
  }

  @Override
  public MeResponse me() {
    User user = getCurrentAuthenticatedUser();
    return userMapper.toMeResponse(user);
  }

  @Override
  @Transactional
  public MeResponse updateProfile(ProfileUpdateRequest req) {
    User user = getCurrentAuthenticatedUser();

    String fullName = req.fullName() == null ? "" : req.fullName().trim();
    if (fullName.isBlank()) {
      throw new ConflictException("Full name is required.");
    }

    user.setFullName(fullName);
    user.setPhone(req.phone() == null ? "" : req.phone().trim());
    user.setDepartment(req.department() == null ? "" : req.department().trim());
    user.setLanguage(req.language() == null || req.language().isBlank() ? "en" : req.language().trim());
    user.setTimezone(req.timezone() == null || req.timezone().isBlank() ? "UTC" : req.timezone().trim());
    user.setEmailNotifications(req.emailNotifications());
    user.setPushNotifications(req.pushNotifications());
    user.setUpdatedAt(Instant.now());

    user = userRepository.save(user);
    return userMapper.toMeResponse(user);
  }

  @Override
  @Transactional
  public MeResponse updateAvatar(MultipartFile file) {
    User user = getCurrentAuthenticatedUser();

    var storedFile = fileStorageService.storeAvatar(user.getId(), file);
    String avatarUrl = "/api/v1/files/avatars/" + user.getId() + "/" + storedFile.storedFileName();

    user.setAvatarUrl(avatarUrl);
    user.setUpdatedAt(Instant.now());

    user = userRepository.save(user);
    return userMapper.toMeResponse(user);
  }

  @Override
  @Transactional
  public void changePassword(String oldPassword, String newPassword) {
    User user = getCurrentAuthenticatedUser();

    if (oldPassword == null || oldPassword.isBlank()) {
      throw new ConflictException("Current password is required.");
    }

    if (newPassword == null || newPassword.isBlank()) {
      throw new ConflictException("New password is required.");
    }

    if (newPassword.length() < 6) {
      throw new ConflictException("New password must be at least 6 characters.");
    }

    if (user.getPassword() == null || user.getPassword().isBlank()) {
      throw new ConflictException("This account does not support password change using current password.");
    }

    if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
      throw new ConflictException("Current password is incorrect.");
    }

    if (passwordEncoder.matches(newPassword, user.getPassword())) {
      throw new ConflictException("New password must be different from current password.");
    }

    user.setPassword(passwordEncoder.encode(newPassword));
    user.setUpdatedAt(Instant.now());
    userRepository.save(user);
  }
}