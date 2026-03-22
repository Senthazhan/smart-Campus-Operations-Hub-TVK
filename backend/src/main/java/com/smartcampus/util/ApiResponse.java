package com.smartcampus.util;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
    Instant timestamp,
    String path,
    boolean success,
    T data,
    ApiError error
) {
  public static <T> ApiResponse<T> ok(String path, T data) {
    return new ApiResponse<>(Instant.now(), path, true, data, null);
  }

  public static ApiResponse<Void> ok(String path) {
    return new ApiResponse<>(Instant.now(), path, true, null, null);
  }

  public static ApiResponse<Void> fail(String path, ApiError error) {
    return new ApiResponse<>(Instant.now(), path, false, null, error);
  }

  public static <T> ApiResponse<T> success(T data) {
    return new ApiResponse<>(Instant.now(), null, true, data, null);
  }

  public static <T> ApiResponse<T> error(String code, String message) {
    return new ApiResponse<>(Instant.now(), null, false, null, new ApiError(code, message, List.of()));
  }
}

