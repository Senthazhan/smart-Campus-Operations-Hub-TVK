package com.smartcampus.dto;

public record AuthResponse(
    String token,
    String type,
    String id,
    String username,
    String email,
    String role
) {
  public AuthResponse(String token, String id, String username, String email, String role) {
    this(token, "Bearer", id, username, email, role);
  }
}
