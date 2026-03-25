package com.smartcampus.controller;

import com.smartcampus.service.TicketService;

import java.nio.file.Files;
import java.nio.file.Path;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

/**
 * TicketAttachmentController
 * ---------------------------
 * Handles file retrieval operations for ticket attachments.
 * 
 * Responsibilities:
 * - View attachment content in browser
 * - Download attachment as a file
 * 
 * Files are stored in the server file system and accessed via path.
 * Only metadata is stored in the database.
 */
@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/attachments")
@RequiredArgsConstructor
public class TicketAttachmentController {

  // Service used to resolve file paths securely
  private final TicketService ticketService;

  /**
   * View attachment content (inline).
   * 
   * Example:
   * - Images open in browser
   * - PDFs preview in browser
   * 
   * @param ticketId ID of ticket
   * @param attachmentId ID of attachment
   * @return file content as Resource
   */
  @GetMapping("/{attachmentId}/content")
  public ResponseEntity<Resource> content(
      @PathVariable String ticketId,
      @PathVariable String attachmentId) {

    try {
      // Get file path from service layer (security + validation handled there)
      Path filePath = ticketService.getAttachmentPath(ticketId, attachmentId);

      // Convert file path into Resource
      Resource resource = new UrlResource(filePath.toUri());

      // Detect file content type (image/png, application/pdf, etc.)
      String contentType = Files.probeContentType(filePath);
      if (contentType == null) {
        contentType = "application/octet-stream"; // fallback
      }

      return ResponseEntity.ok()
          .contentType(MediaType.parseMediaType(contentType))
          .body(resource);

    } catch (Exception e) {
      // If file not found or error occurs
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Download attachment file.
   * 
   * Forces browser to download instead of preview.
   * 
   * @param ticketId ID of ticket
   * @param attachmentId ID of attachment
   * @return downloadable file response
   */
  @GetMapping("/{attachmentId}/download")
  public ResponseEntity<Resource> download(
      @PathVariable String ticketId,
      @PathVariable String attachmentId) {

    try {
      // Resolve file path
      Path filePath = ticketService.getAttachmentPath(ticketId, attachmentId);

      // Convert to Resource
      Resource resource = new UrlResource(filePath.toUri());

      // Extract file name
      String fileName = filePath.getFileName().toString();

      return ResponseEntity.ok()
          .contentType(MediaType.parseMediaType("application/octet-stream"))
          // Forces file download
          .header(HttpHeaders.CONTENT_DISPOSITION,
              "attachment; filename=\"" + fileName + "\"")
          .body(resource);

    } catch (Exception e) {
      // Return 404 if file not found
      return ResponseEntity.notFound().build();
    }
  }
}