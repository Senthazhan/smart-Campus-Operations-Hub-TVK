package com.smartcampus.util;

import java.util.List;

public record ApiError(
    String code,
    String message,
    List<FieldViolation> violations
) {
  public record FieldViolation(String field, String message) {}
}

