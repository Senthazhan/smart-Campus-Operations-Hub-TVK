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

/**
 * CommentController
 * ------------------
 * Handles operations related to Ticket Comments.
 * 
 * Responsibilities:
 * - Update existing comments
 * - Delete comments
 * 
 * Comments are part of the ticket collaboration system,
 * allowing communication between:
 * - Users
 * - Admins
 * - Technicians
 */
@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {

  // Service layer handles business logic and ownership validation
  private final TicketService ticketService;

  /**
   * Update an existing comment.
   * 
   * Rules:
   * - Only the comment owner or ADMIN can update
   * - Edited flag should be set in service layer
   * 
   * @param commentId ID of the comment
   * @param body updated comment content
   * @return updated comment response
   */
  @PutMapping("/{commentId}")
  public ResponseEntity<ApiResponse<TicketCommentResponse>> update(
      @PathVariable String commentId,
      @Valid @RequestBody TicketCommentUpdateRequest body,
      HttpServletRequest req) {

    return ResponseEntity.ok(
        ApiResponse.ok(req.getRequestURI(),
            ticketService.updateComment(commentId, body)));
  }

  /**
   * Delete a comment.
   * 
   * Rules:
   * - Only the comment owner or ADMIN can delete
   * - Used for moderation and cleanup
   * 
   * @param commentId ID of the comment
   * @return 204 No Content on success
   */
  @DeleteMapping("/{commentId}")
  public ResponseEntity<Void> delete(@PathVariable String commentId) {

    ticketService.deleteComment(commentId);

    return ResponseEntity.noContent().build();
  }
}