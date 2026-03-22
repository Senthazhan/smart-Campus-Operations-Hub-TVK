package com.smartcampus.controller;

import com.smartcampus.entity.TicketAttachment;
import com.smartcampus.exception.NotFoundException;
import com.smartcampus.service.TicketService;
import java.nio.file.Files;
import java.nio.file.Path;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/attachments")
@RequiredArgsConstructor
public class TicketAttachmentController {

  private final com.smartcampus.repository.TicketAttachmentRepository attachmentRepository;
  private final TicketService ticketService;

  @GetMapping("/{attachmentId}/content")
  public ResponseEntity<Resource> content(@PathVariable String ticketId, @PathVariable String attachmentId) {
    try {
      Path filePath = ticketService.getAttachmentPath(ticketId, attachmentId);
      Resource resource = new UrlResource(filePath.toUri());
      String contentType = Files.probeContentType(filePath);
      if (contentType == null) contentType = "application/octet-stream";

      return ResponseEntity.ok()
          .contentType(MediaType.parseMediaType(contentType))
          .body(resource);
    } catch (Exception e) {
      return ResponseEntity.notFound().build();
    }
  }

  @GetMapping("/{attachmentId}/download")
  public ResponseEntity<Resource> download(@PathVariable String ticketId, @PathVariable String attachmentId) {
    try {
      Path filePath = ticketService.getAttachmentPath(ticketId, attachmentId);
      Resource resource = new UrlResource(filePath.toUri());
      String fileName = filePath.getFileName().toString();

      return ResponseEntity.ok()
          .contentType(MediaType.parseMediaType("application/octet-stream"))
          .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
          .body(resource);
    } catch (Exception e) {
      return ResponseEntity.notFound().build();
    }
  }
}

