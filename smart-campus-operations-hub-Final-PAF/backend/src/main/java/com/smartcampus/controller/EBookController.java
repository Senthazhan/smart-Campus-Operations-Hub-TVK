package com.smartcampus.controller;

import com.smartcampus.dto.request.EBookAdminFlagCreateRequest;
import com.smartcampus.dto.request.EBookReportCreateRequest;
import com.smartcampus.dto.response.EBookAdminFlagResponse;
import com.smartcampus.dto.response.EBookReportResponse;
import com.smartcampus.dto.response.EBookResponse;
import com.smartcampus.dto.response.EBookSubmissionResponse;
import com.smartcampus.service.EBookService;
import com.smartcampus.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/ebooks")
@RequiredArgsConstructor
public class EBookController {

  private final EBookService ebookService;

  @GetMapping
  public ResponseEntity<ApiResponse<Page<EBookResponse>>> list(
      @RequestParam(required = false) String q,
      @PageableDefault(size = 12) Pageable pageable,
      HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), ebookService.search(q, pageable)));
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<EBookResponse>> create(
      @RequestParam String title,
      @RequestParam(required = false) String description,
      @RequestParam("file") MultipartFile file,
      HttpServletRequest req) {
    var created = ebookService.createByAdmin(title, description, file);
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(req.getRequestURI(), created));
  }

  @GetMapping("/admin/flags")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Page<EBookAdminFlagResponse>>> listAdminFlags(
      @PageableDefault(size = 20) Pageable pageable,
      HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), ebookService.listAdminFlags(pageable)));
  }

  @DeleteMapping("/admin/{ebookId}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteEbookAsAdmin(
      @PathVariable String ebookId,
      HttpServletRequest req) {
    ebookService.deleteEbookAsAdmin(ebookId);
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI()));
  }

  @GetMapping("/{id}/download")
  public ResponseEntity<Resource> download(@PathVariable String id) {
    Resource resource = ebookService.downloadEbook(id);
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ebook.pdf\"")
        .body(resource);
  }

  @PostMapping("/{id}/reports")
  public ResponseEntity<ApiResponse<Void>> report(
      @PathVariable String id,
      @Valid @RequestBody EBookReportCreateRequest body,
      HttpServletRequest req) {
    ebookService.reportEbook(id, body);
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI()));
  }

  @PostMapping("/{id}/admin-flag")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Void>> adminFlag(
      @PathVariable String id,
      @RequestBody(required = false) EBookAdminFlagCreateRequest body,
      HttpServletRequest req) {
    ebookService.flagEbookAsAdmin(id, body != null ? body : new EBookAdminFlagCreateRequest(null));
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI()));
  }

  @GetMapping("/reports")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Page<EBookReportResponse>>> listReports(
      @PageableDefault(size = 20) Pageable pageable,
      HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), ebookService.listReports(pageable)));
  }

  @PostMapping(value = "/submissions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ApiResponse<EBookSubmissionResponse>> submit(
      @RequestParam String title,
      @RequestParam(required = false) String description,
      @RequestParam("file") MultipartFile file,
      HttpServletRequest req) {
    var created = ebookService.submitBook(title, description, file);
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(req.getRequestURI(), created));
  }

  @GetMapping("/submissions/me")
  public ResponseEntity<ApiResponse<java.util.List<EBookSubmissionResponse>>> mySubmissions(HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), ebookService.mySubmissions()));
  }

  @GetMapping("/submissions/pending")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Page<EBookSubmissionResponse>>> pendingSubmissions(
      @PageableDefault(size = 20) Pageable pageable,
      HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), ebookService.pendingSubmissions(pageable)));
  }

  @PostMapping("/submissions/{submissionId}/accept")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<EBookResponse>> acceptSubmission(
      @PathVariable String submissionId,
      HttpServletRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI(), ebookService.acceptSubmission(submissionId)));
  }

  @PostMapping("/submissions/{submissionId}/reject")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Void>> rejectSubmission(
      @PathVariable String submissionId,
      HttpServletRequest req) {
    ebookService.rejectSubmission(submissionId);
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI()));
  }

  /**
   * Cancel/remove own submission (pending or rejected). Path uses {@code /me/} so it never
   * collides with {@code DELETE /{ebookId}} for removing a published library copy.
   */
  @DeleteMapping("/submissions/me/{submissionId}")
  public ResponseEntity<ApiResponse<Void>> deleteMySubmission(
      @PathVariable String submissionId,
      HttpServletRequest req) {
    ebookService.deleteMySubmission(submissionId);
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI()));
  }

  /** Removes a library entry the current user originally published (e.g. accepted submission). */
  @DeleteMapping("/{ebookId}")
  public ResponseEntity<ApiResponse<Void>> deleteMyPublishedEbook(
      @PathVariable String ebookId,
      HttpServletRequest req) {
    ebookService.deleteMyPublishedEbook(ebookId);
    return ResponseEntity.ok(ApiResponse.ok(req.getRequestURI()));
  }
}
