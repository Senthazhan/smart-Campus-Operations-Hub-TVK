package com.smartcampus.controller;

import com.smartcampus.dto.request.*;
import com.smartcampus.dto.response.*;
import com.smartcampus.enums.*;
import com.smartcampus.service.TicketService;
import com.smartcampus.util.ApiResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * TicketController
 * -----------------
 * Handles all REST API endpoints related to Ticket Management.
 * 
 * Responsibilities:
 * - Ticket creation with optional file attachments
 * - Ticket retrieval (single + paginated list)
 * - Ticket status updates (workflow transitions)
 * - Technician assignment
 * - Comments and attachments handling
 * 
 * Follows RESTful design principles and uses ApiResponse wrapper
 * for consistent API responses.
 */
@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

  // Service layer dependency (business logic handled here)
  private final TicketService ticketService;

  /**
   * Create a new ticket with optional attachments.
   * 
   * Supports multipart/form-data and JSON.
   * Converts string inputs into ENUM values.
   * 
   * @param resourceId optional resource reference
   * @param locationText optional manual location
   * @param title ticket title
   * @param category ticket category (ENUM)
   * @param priority ticket priority (ENUM)
   * @param description issue description
   * @param preferredContact user contact method
   * @param attachments optional file uploads (max 3 expected)
   * 
   * @return created TicketResponse
   */
  @PostMapping(consumes = { "multipart/form-data", "application/json" })
  public ResponseEntity<ApiResponse<TicketResponse>> create(
      @RequestParam(required = false) String resourceId,
      @RequestParam(required = false) String locationText,
      @RequestParam String title,
      @RequestParam String category,
      @RequestParam String priority,
      @RequestParam String description,
      @RequestParam String preferredContact,
      @RequestParam(required = false) MultipartFile[] attachments,
      HttpServletRequest req) {

    try {
      // Convert request data into DTO
      var body = new TicketCreateRequest(
          resourceId != null && !resourceId.isEmpty() ? resourceId : null,
          locationText,
          title,
          TicketCategory.valueOf(category.toUpperCase()), // Convert to ENUM
          TicketPriority.valueOf(priority.toUpperCase()), // Convert to ENUM
          description,
          preferredContact);

      // Call service layer to create ticket + handle attachments
      var created = ticketService.createWithAttachments(
          body,
          attachments != null ? attachments : new MultipartFile[0]);

      return ResponseEntity.status(HttpStatus.CREATED)
          .body(ApiResponse.ok(req.getRequestURI(), created));

    } catch (IllegalArgumentException e) {
      // Handle invalid ENUM values 400
      return ResponseEntity.badRequest()
          .body(ApiResponse.error("INVALID_ENUM",
              "Invalid category or priority: " + e.getMessage()));

    } catch (Exception e) {
      // Generic error handling
      e.printStackTrace();
      //500
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("SERVER_ERROR",
              "Failed to create ticket: " + e.getMessage()));
    }
  }

  /**
   * Get paginated list of tickets with optional filters.
   * 
   * Filters:
   * - Search query (q)
   * - Status
   * - Category
   * - Priority
   * 
   * Default sorting: createdAt DESC
   */
  @GetMapping
  public ResponseEntity<ApiResponse<Page<TicketResponse>>> list(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) TicketStatus status,
      @RequestParam(required = false) TicketCategory category,
      @RequestParam(required = false) TicketPriority priority,
      @PageableDefault(size = 10, sort = "createdAt",
          direction = org.springframework.data.domain.Sort.Direction.DESC)
      Pageable pageable,
      HttpServletRequest req) {

    return ResponseEntity.ok(
        ApiResponse.ok(req.getRequestURI(),
            ticketService.list(q, status, category, priority, pageable)));
  }

  /**
   * Get a single ticket by ID.
   */
  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<TicketResponse>> get(
      @PathVariable String id,
      HttpServletRequest req) {

    return ResponseEntity.ok(
        ApiResponse.ok(req.getRequestURI(),
            ticketService.get(id)));
  }

  /**
   * Update ticket status (workflow transition).
   * 
   * Allowed roles:
   * - ADMIN
   * - TECHNICIAN
   * 
   * Example transitions:
   * OPEN → IN_PROGRESS → RESOLVED → CLOSED
   */
  @PatchMapping("/{id}/status")
  @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
  public ResponseEntity<ApiResponse<TicketResponse>> status(
      @PathVariable String id,
      @Valid @RequestBody TicketStatusUpdateRequest body,
      HttpServletRequest req) {

    return ResponseEntity.ok(
        ApiResponse.ok(req.getRequestURI(),
            ticketService.updateStatus(id, body)));
  }

  /**
   * Assign a technician to a ticket.
   * 
   * Only ADMIN can perform this action.
   */
  @PatchMapping("/{id}/assign-technician")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<TicketResponse>> assign(
      @PathVariable String id,
      @Valid @RequestBody TicketAssignTechnicianRequest body,
      HttpServletRequest req) {

    return ResponseEntity.ok(
        ApiResponse.ok(req.getRequestURI(),
            ticketService.assignTechnician(id, body)));
  }

  /**
   * Upload attachments to a ticket.
   * 
   * Files are stored in server file system.
   * Metadata saved in database.
   */
  @PostMapping("/{id}/attachments")
  public ResponseEntity<ApiResponse<List<TicketAttachmentResponse>>> upload(
      @PathVariable String id,
      @RequestParam("files") MultipartFile[] files,
      HttpServletRequest req) {

    // 201
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(req.getRequestURI(),
            ticketService.uploadAttachments(id, files)));
  }

  /**
   * Add a comment to a ticket.
   * 
   * Supports collaboration between:
   * - User
   * - Admin
   * - Technician
   */
  @PostMapping("/{id}/comments")
  public ResponseEntity<ApiResponse<TicketCommentResponse>> addComment(
      @PathVariable String id,
      @Valid @RequestBody TicketCommentCreateRequest body,
      HttpServletRequest req) {

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(req.getRequestURI(),
            ticketService.addComment(id, body)));
  }
}