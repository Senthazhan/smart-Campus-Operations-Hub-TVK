package com.smartcampus.controller;

import com.smartcampus.dto.request.TicketAssignTechnicianRequest;
import com.smartcampus.dto.request.TicketCommentCreateRequest;
import com.smartcampus.dto.request.TicketCommentUpdateRequest;
import com.smartcampus.dto.request.TicketCreateRequest;
import com.smartcampus.dto.request.TicketStatusUpdateRequest;
import com.smartcampus.dto.response.TicketAttachmentResponse;
import com.smartcampus.dto.response.TicketCommentResponse;
import com.smartcampus.dto.response.TicketResponse;
import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
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
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

  private final TicketService ticketService;

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
      var body = new TicketCreateRequest(
          resourceId != null && !resourceId.isEmpty() ? resourceId : null,
          locationText,
          title,
          TicketCategory.valueOf(category.toUpperCase()),
          TicketPriority.valueOf(priority.toUpperCase()),
          description,
          preferredContact);
      var created = ticketService.createWithAttachments(body, attachments != null ? attachments : new MultipartFile[0]);
      return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(req.getRequestURI(), created));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest()
          .body(ApiResponse.error("INVALID_ENUM", "Invalid category or priority: " + e.getMessage()));
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("SERVER_ERROR", "Failed to create ticket: " + e.getMessage()));
    }
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Page<TicketResponse>>> list(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) TicketStatus status,
      @RequestParam(required = false) TicketCategory category,
      @RequestParam(required = false) TicketPriority priority,
      @PageableDefault(size = 10, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable,
      HttpServletRequest req) {
    return ResponseEntity
        .ok(ApiResponse.ok(req.getRequestURI(), ticketService.list(q, status, category, priority, pageable)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<TicketResponse>> get(@PathVariable String id, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), ticketService.get(id)));
  }

  @PatchMapping("/{id}/status")
  @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
  public ResponseEntity<ApiResponse<TicketResponse>> status(@PathVariable String id,
      @Valid @RequestBody TicketStatusUpdateRequest body, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), ticketService.updateStatus(id, body)));
  }

  @PatchMapping("/{id}/assign-technician")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<TicketResponse>> assign(@PathVariable String id,
      @Valid @RequestBody TicketAssignTechnicianRequest body, HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), ticketService.assignTechnician(id, body)));
  }

  @PostMapping("/{id}/attachments")
  public ResponseEntity<ApiResponse<List<TicketAttachmentResponse>>> upload(
      @PathVariable String id,
      @RequestParam("files") MultipartFile[] files,
      HttpServletRequest req) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(req.getRequestURI(), ticketService.uploadAttachments(id, files)));
  }

  @PostMapping("/{id}/comments")
  public ResponseEntity<ApiResponse<TicketCommentResponse>> addComment(@PathVariable String id,
      @Valid @RequestBody TicketCommentCreateRequest body, HttpServletRequest req) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(req.getRequestURI(), ticketService.addComment(id, body)));
  }
}
