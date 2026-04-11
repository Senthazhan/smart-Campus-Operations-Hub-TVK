package com.smartcampus.service;

import com.smartcampus.dto.request.EBookAdminFlagCreateRequest;
import com.smartcampus.dto.request.EBookReportCreateRequest;
import com.smartcampus.dto.response.EBookAdminFlagResponse;
import com.smartcampus.dto.response.EBookResponse;
import com.smartcampus.dto.response.EBookReportResponse;
import com.smartcampus.dto.response.EBookSubmissionResponse;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface EBookService {
  Page<EBookResponse> search(String q, Pageable pageable);

  EBookResponse createByAdmin(String title, String description, MultipartFile file);

  Resource downloadEbook(String ebookId);

  void reportEbook(String ebookId, EBookReportCreateRequest request);

  Page<EBookReportResponse> listReports(Pageable pageable);

  EBookSubmissionResponse submitBook(String title, String description, MultipartFile file);

  List<EBookSubmissionResponse> mySubmissions();

  Page<EBookSubmissionResponse> pendingSubmissions(Pageable pageable);

  EBookResponse acceptSubmission(String submissionId);

  void rejectSubmission(String submissionId);

  void deleteMySubmission(String submissionId);

  void deleteMyPublishedEbook(String ebookId);

  void deleteEbookAsAdmin(String ebookId);

  void flagEbookAsAdmin(String ebookId, EBookAdminFlagCreateRequest request);

  Page<EBookAdminFlagResponse> listAdminFlags(Pageable pageable);
}
