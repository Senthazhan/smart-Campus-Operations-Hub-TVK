package com.smartcampus.service.impl;

import com.smartcampus.dto.request.EBookAdminFlagCreateRequest;
import com.smartcampus.dto.request.EBookReportCreateRequest;
import com.smartcampus.dto.response.EBookAdminFlagResponse;
import com.smartcampus.dto.response.EBookReportResponse;
import com.smartcampus.dto.response.EBookResponse;
import com.smartcampus.dto.response.EBookSubmissionResponse;
import com.smartcampus.entity.EBook;
import com.smartcampus.entity.EBookAdminFlag;
import com.smartcampus.entity.EBookReport;
import com.smartcampus.entity.EBookSubmission;
import com.smartcampus.enums.EBookSubmissionStatus;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.ForbiddenException;
import com.smartcampus.exception.NotFoundException;
import com.smartcampus.repository.EBookAdminFlagRepository;
import com.smartcampus.repository.EBookReportRepository;
import com.smartcampus.repository.EBookRepository;
import com.smartcampus.repository.EBookSubmissionRepository;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.service.EBookService;
import com.smartcampus.util.FileStorageService;
import java.io.IOException;
import java.nio.file.Files;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class EBookServiceImpl implements EBookService {

  private final EBookRepository ebookRepository;
  private final EBookReportRepository ebookReportRepository;
  private final EBookAdminFlagRepository ebookAdminFlagRepository;
  private final EBookSubmissionRepository ebookSubmissionRepository;
  private final FileStorageService fileStorageService;
  private final MongoTemplate mongoTemplate;

  @Override
  public Page<EBookResponse> search(String q, Pageable pageable) {
    Query query = new Query();
    if (q != null && !q.isBlank()) {
      String[] words = q.trim().split("\\s+");
      for (String raw : words) {
        String w = raw.trim();
        if (w.isEmpty()) {
          continue;
        }
        String esc = Pattern.quote(w);
        query.addCriteria(new Criteria().orOperator(
            Criteria.where("title").regex(esc, "i"),
            Criteria.where("description").regex(esc, "i")));
      }
    }
    long total = mongoTemplate.count(query, EBook.class);
    query.with(pageable);
    List<EBook> list = mongoTemplate.find(query, EBook.class);
    List<EBookResponse> mapped = list.stream().map(this::toResponse).toList();
    return new PageImpl<>(mapped, pageable, total);
  }

  @Override
  @Transactional
  public EBookResponse createByAdmin(String title, String description, MultipartFile file) {
    if (title == null || title.isBlank()) {
      throw new ConflictException("Title is required");
    }
    String id = new ObjectId().toString();
    var stored = fileStorageService.storeEbookPdf(id, file);
    EBook eb = new EBook();
    eb.setId(id);
    eb.setTitle(title.trim());
    eb.setDescription(description == null ? "" : description.trim());
    eb.setStoredFileName(stored.storedFileName());
    eb.setUploadedAt(Instant.now());
    eb.setUploadedBy(CurrentUser.id());
    eb = ebookRepository.save(eb);
    return toResponse(eb);
  }

  @Override
  public Resource downloadEbook(String ebookId) {
    EBook eb = ebookRepository.findById(ebookId).orElseThrow(() -> new NotFoundException("E-book not found"));
    try {
      var path = fileStorageService.resolveEbookFile(eb.getId(), eb.getStoredFileName());
      if (!Files.exists(path) || !Files.isReadable(path)) {
        throw new NotFoundException("E-book file not found");
      }
      return new UrlResource(path.toUri());
    } catch (IOException e) {
      throw new NotFoundException("E-book file not found");
    }
  }

  @Override
  @Transactional
  public void reportEbook(String ebookId, EBookReportCreateRequest request) {
    if (!ebookRepository.existsById(ebookId)) {
      throw new NotFoundException("E-book not found");
    }
    EBookReport r = new EBookReport();
    r.setEbookId(ebookId);
    r.setReporterUserId(CurrentUser.id());
    r.setReason(request.reason().trim());
    r.setCreatedAt(Instant.now());
    ebookReportRepository.save(r);
  }

  @Override
  public Page<EBookReportResponse> listReports(Pageable pageable) {
    Page<EBookReport> page = ebookReportRepository.findAllByOrderByCreatedAtDesc(pageable);
    List<EBookReportResponse> out = new ArrayList<>();
    for (EBookReport r : page.getContent()) {
      String title = ebookRepository.findById(r.getEbookId()).map(EBook::getTitle).orElse("(removed)");
      out.add(new EBookReportResponse(
          r.getId(), r.getEbookId(), title, r.getReporterUserId(), r.getReason(), r.getCreatedAt()));
    }
    return new PageImpl<>(out, pageable, page.getTotalElements());
  }

  @Override
  @Transactional
  public EBookSubmissionResponse submitBook(String title, String description, MultipartFile file) {
    if (title == null || title.isBlank()) {
      throw new ConflictException("Title is required");
    }
    String id = new ObjectId().toString();
    var stored = fileStorageService.storeEbookSubmissionPdf(id, file);
    EBookSubmission s = new EBookSubmission();
    s.setId(id);
    s.setTitle(title.trim());
    s.setDescription(description == null ? "" : description.trim());
    s.setStoredFileName(stored.storedFileName());
    s.setSubmittedBy(CurrentUser.id());
    s.setSubmittedAt(Instant.now());
    s.setStatus(EBookSubmissionStatus.PENDING);
    s = ebookSubmissionRepository.save(s);
    return toSubmissionResponse(s);
  }

  @Override
  public List<EBookSubmissionResponse> mySubmissions() {
    String uid = CurrentUser.id();
    return ebookSubmissionRepository.findBySubmittedByOrderBySubmittedAtDesc(uid).stream()
        .map(this::toSubmissionResponse)
        .toList();
  }

  @Override
  public Page<EBookSubmissionResponse> pendingSubmissions(Pageable pageable) {
    Page<EBookSubmission> page =
        ebookSubmissionRepository.findByStatus(EBookSubmissionStatus.PENDING, pageable);
    return PageableExecutionUtils.getPage(
        page.getContent().stream().map(this::toSubmissionResponse).toList(),
        pageable,
        page::getTotalElements);
  }

  @Override
  @Transactional
  public EBookResponse acceptSubmission(String submissionId) {
    EBookSubmission s = ebookSubmissionRepository.findById(submissionId)
        .orElseThrow(() -> new NotFoundException("Submission not found"));
    if (s.getStatus() != EBookSubmissionStatus.PENDING) {
      throw new ConflictException("Submission is not pending");
    }
    String newEbookId = new ObjectId().toString();
    try {
      fileStorageService.copyEbookSubmissionToLibrary(
          s.getId(), s.getStoredFileName(), newEbookId);
    } catch (IOException e) {
      throw new ConflictException("Failed to publish submission");
    }
    EBook eb = new EBook();
    eb.setId(newEbookId);
    eb.setTitle(s.getTitle());
    eb.setDescription(s.getDescription());
    eb.setStoredFileName("ebook.pdf");
    eb.setUploadedAt(Instant.now());
    eb.setUploadedBy(s.getSubmittedBy());
    eb = ebookRepository.save(eb);

    s.setStatus(EBookSubmissionStatus.ACCEPTED);
    s.setReviewedAt(Instant.now());
    s.setReviewedBy(CurrentUser.id());
    s.setPublishedEbookId(eb.getId());
    ebookSubmissionRepository.save(s);

    return toResponse(eb);
  }

  @Override
  @Transactional
  public void rejectSubmission(String submissionId) {
    EBookSubmission s = ebookSubmissionRepository.findById(submissionId)
        .orElseThrow(() -> new NotFoundException("Submission not found"));
    if (s.getStatus() != EBookSubmissionStatus.PENDING) {
      throw new ConflictException("Submission is not pending");
    }
    s.setStatus(EBookSubmissionStatus.REJECTED);
    s.setReviewedAt(Instant.now());
    s.setReviewedBy(CurrentUser.id());
    ebookSubmissionRepository.save(s);
  }

  @Override
  @Transactional
  public void deleteMySubmission(String submissionId) {
    EBookSubmission s = ebookSubmissionRepository.findById(submissionId.trim())
        .orElseThrow(() -> new NotFoundException("Submission not found"));
    String uid = Objects.toString(CurrentUser.id(), "").trim();
    String owner = Objects.toString(s.getSubmittedBy(), "").trim();
    if (!uid.equals(owner)) {
      throw new ForbiddenException("Not your submission");
    }
    if (s.getStatus() == EBookSubmissionStatus.ACCEPTED) {
      throw new ConflictException("Remove the published copy from the library first");
    }
    fileStorageService.deleteEbookSubmissionDirectory(s.getId());
    ebookSubmissionRepository.delete(s);
  }

  @Override
  @Transactional
  public void deleteMyPublishedEbook(String ebookId) {
    EBook eb = ebookRepository.findById(ebookId)
        .orElseThrow(() -> new NotFoundException("E-book not found"));
    if (!CurrentUser.id().equals(eb.getUploadedBy())) {
      throw new ForbiddenException("Not your e-book");
    }
    purgeEbookFromLibrary(eb);
  }

  @Override
  @Transactional
  public void deleteEbookAsAdmin(String ebookId) {
    EBook eb = ebookRepository.findById(ebookId)
        .orElseThrow(() -> new NotFoundException("E-book not found"));
    purgeEbookFromLibrary(eb);
  }

  @Override
  @Transactional
  public void flagEbookAsAdmin(String ebookId, EBookAdminFlagCreateRequest request) {
    if (!ebookRepository.existsById(ebookId)) {
      throw new NotFoundException("E-book not found");
    }
    EBookAdminFlag f = new EBookAdminFlag();
    f.setId(new ObjectId().toString());
    f.setEbookId(ebookId);
    f.setFlaggedBy(CurrentUser.id());
    String note = "";
    if (request != null && request.note() != null && !request.note().isBlank()) {
      note = request.note().trim();
    }
    f.setNote(note);
    f.setCreatedAt(Instant.now());
    ebookAdminFlagRepository.save(f);
  }

  @Override
  public Page<EBookAdminFlagResponse> listAdminFlags(Pageable pageable) {
    Page<EBookAdminFlag> page = ebookAdminFlagRepository.findAllByOrderByCreatedAtDesc(pageable);
    List<EBookAdminFlagResponse> out = new ArrayList<>();
    for (EBookAdminFlag f : page.getContent()) {
      String title = ebookRepository.findById(f.getEbookId()).map(EBook::getTitle).orElse("(removed)");
      out.add(new EBookAdminFlagResponse(
          f.getId(), f.getEbookId(), title, f.getFlaggedBy(), f.getNote(), f.getCreatedAt()));
    }
    return new PageImpl<>(out, pageable, page.getTotalElements());
  }

  private void purgeEbookFromLibrary(EBook eb) {
    String ebookId = eb.getId();
    ebookReportRepository.deleteByEbookId(ebookId);
    ebookAdminFlagRepository.deleteByEbookId(ebookId);
    fileStorageService.deleteEbookDirectory(eb.getId());
    ebookRepository.deleteById(ebookId);
    ebookSubmissionRepository.findByPublishedEbookId(ebookId).ifPresent(sub -> {
      fileStorageService.deleteEbookSubmissionDirectory(sub.getId());
      ebookSubmissionRepository.delete(sub);
    });
  }

  private EBookResponse toResponse(EBook eb) {
    return new EBookResponse(
        eb.getId(), eb.getTitle(), eb.getDescription(), eb.getUploadedAt(), eb.getUploadedBy());
  }

  private EBookSubmissionResponse toSubmissionResponse(EBookSubmission s) {
    return new EBookSubmissionResponse(
        s.getId(),
        s.getTitle(),
        s.getDescription(),
        s.getStatus(),
        s.getSubmittedAt(),
        s.getSubmittedBy(),
        s.getReviewedAt(),
        s.getReviewedBy(),
        s.getPublishedEbookId());
  }
}
