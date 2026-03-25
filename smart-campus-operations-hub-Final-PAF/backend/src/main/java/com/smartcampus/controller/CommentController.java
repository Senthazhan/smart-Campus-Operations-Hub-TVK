package com.smartcampus.controller;

import com.smartcampus.dto.request.TicketCommentUpdateRequest;
import com.smartcampus.dto.response.TicketCommentResponse;
import com.smartcampus.service.TicketService;
import com.smartcampus.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {

  private final TicketService ticketService;

  @PutMapping("/{commentId}")
  public ResponseEntity<ApiResponse<TicketCommentResponse>> update(@PathVariable String commentId, @Valid @RequestBody TicketCommentUpdateRequest body, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), ticketService.updateComment(commentId, body)));
  }

  @DeleteMapping("/{commentId}")
  public ResponseEntity<Void> delete(@PathVariable String commentId) {
    ticketService.deleteComment(commentId);
    return ResponseEntity.noContent().build();
  }
}

