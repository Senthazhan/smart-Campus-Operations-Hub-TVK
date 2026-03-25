package com.smartcampus.service;

import com.smartcampus.dto.request.ProfileUpdateRequest;
import com.smartcampus.dto.response.MeResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
  MeResponse me();
  MeResponse updateProfile(ProfileUpdateRequest req);
  MeResponse updateAvatar(MultipartFile file);
  void changePassword(String oldPassword, String newPassword);
}
