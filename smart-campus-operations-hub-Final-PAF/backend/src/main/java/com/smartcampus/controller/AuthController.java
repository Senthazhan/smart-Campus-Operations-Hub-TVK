package com.smartcampus.controller;

import com.smartcampus.dto.AuthResponse;
import com.smartcampus.dto.LoginRequest;
import com.smartcampus.dto.RegisterRequest;
import com.smartcampus.entity.PasswordResetToken;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.enums.RoleName;
import com.smartcampus.repository.PasswordResetTokenRepository;
import com.smartcampus.repository.RoleRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtils;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

  private final AuthenticationManager authenticationManager;
  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtils jwtUtils;
  private final PasswordResetTokenRepository passwordResetTokenRepository;
  private final com.smartcampus.service.EmailService emailService;

  @org.springframework.beans.factory.annotation.Value("${app.frontend-base-url}")
  private String frontendBaseUrl;

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            loginRequest.usernameOrEmail(),
            loginRequest.password()
        )
    );

    SecurityContextHolder.getContext().setAuthentication(authentication);
    String jwt = jwtUtils.generateToken(authentication);

    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

    return ResponseEntity.ok(ApiResponse.success(new AuthResponse(
        jwt,
        userPrincipal.getId(),
        userPrincipal.getUsername(),
        userPrincipal.getEmail(),
        userPrincipal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")
    )));
  }

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
    if (userRepository.existsByUsername(registerRequest.username())) {
      return ResponseEntity.badRequest().body(ApiResponse.error("AUTH_ERR", "Username is already taken!"));
    }

    if (userRepository.existsByEmail(registerRequest.email())) {
      return ResponseEntity.badRequest().body(ApiResponse.error("AUTH_ERR", "Email Address already in use!"));
    }

    User user = new User();
    user.setUsername(registerRequest.username());
    user.setFullName(registerRequest.fullName());
    user.setEmail(registerRequest.email());
    user.setPassword(passwordEncoder.encode(registerRequest.password()));
    user.setDepartment(registerRequest.department());
    user.setPhone(registerRequest.phone());
    user.setProvider("LOCAL");
    user.setProviderSubject("local-" + registerRequest.username());
    user.setStatus("ACTIVE");

    Role userRole = roleRepository.findByName(RoleName.USER)
        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

    user.setRole(userRole);
    userRepository.save(user);

    return ResponseEntity.ok(ApiResponse.success("User registered successfully"));
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────

  @PostMapping("/forgot-password")
  public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody Map<String, String> body) {
    String email = body.get("email");
    if (email == null || email.isBlank()) {
      return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION", "Email is required"));
    }

    var userOpt = userRepository.findByEmail(email);
    // Always return success to prevent user enumeration
    if (userOpt.isEmpty()) {
      log.warn("Password reset requested for unknown email: {}", email);
      return ResponseEntity.ok(ApiResponse.success("If that email exists, a reset link has been sent."));
    }

    User user = userOpt.get();

    // Invalidate any existing tokens for this user
    passwordResetTokenRepository.deleteByUserId(user.getId());

    // Create new token (valid for 1 hour)
    PasswordResetToken resetToken = new PasswordResetToken();
    resetToken.setToken(UUID.randomUUID().toString());
    resetToken.setUserId(user.getId());
    resetToken.setExpiresAt(Instant.now().plusSeconds(3600));
    passwordResetTokenRepository.save(resetToken);

    // Send via email
    String resetUrl = frontendBaseUrl + "/reset-password?token=" + resetToken.getToken();
    try {
      emailService.sendPasswordResetEmail(email, resetUrl);
    } catch (Exception e) {
      log.error("Failed to send reset email to {}", email, e);
    }

    return ResponseEntity.ok(ApiResponse.success("If that email exists, a reset link has been sent."));
  }

  @GetMapping("/validate-reset-token")
  public ResponseEntity<ApiResponse<Boolean>> validateResetToken(@RequestParam String token) {
    var tokenOpt = passwordResetTokenRepository.findByToken(token);
    if (tokenOpt.isEmpty()) {
      return ResponseEntity.ok(ApiResponse.success(false));
    }
    PasswordResetToken resetToken = tokenOpt.get();
    boolean valid = !resetToken.isUsed() && Instant.now().isBefore(resetToken.getExpiresAt());
    return ResponseEntity.ok(ApiResponse.success(valid));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody Map<String, String> body) {
    String token = body.get("token");
    String newPassword = body.get("newPassword");

    if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
      return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION", "Token and newPassword are required"));
    }

    if (newPassword.length() < 6) {
      return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION", "Password must be at least 6 characters"));
    }

    var tokenOpt = passwordResetTokenRepository.findByToken(token);
    if (tokenOpt.isEmpty()) {
      return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_TOKEN", "Invalid or expired reset token"));
    }

    PasswordResetToken resetToken = tokenOpt.get();

    if (resetToken.isUsed()) {
      return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_TOKEN", "This reset link has already been used"));
    }

    if (Instant.now().isAfter(resetToken.getExpiresAt())) {
      return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_TOKEN", "Reset link has expired. Please request a new one."));
    }

    var userOpt = userRepository.findById(resetToken.getUserId());
    if (userOpt.isEmpty()) {
      return ResponseEntity.badRequest().body(ApiResponse.error("NOT_FOUND", "User not found"));
    }

    User user = userOpt.get();
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);

    // Mark token as used
    resetToken.setUsed(true);
    passwordResetTokenRepository.save(resetToken);

    log.info("Password successfully reset for user: {}", user.getEmail());

    return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully. You can now log in."));
  }
}
