package com.smartcampus.service;

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
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface TicketService {
  TicketResponse create(TicketCreateRequest req);

  TicketResponse createWithAttachments(TicketCreateRequest req, MultipartFile[] files);

  Page<TicketResponse> list(String q, TicketStatus status, TicketCategory category, TicketPriority priority,
      Pageable pageable);

  TicketResponse get(String id);

  TicketResponse updateStatus(String id, TicketStatusUpdateRequest req);

  TicketResponse assignTechnician(String id, TicketAssignTechnicianRequest req);

  List<TicketAttachmentResponse> uploadAttachments(String id, MultipartFile[] files);

  TicketCommentResponse addComment(String id, TicketCommentCreateRequest req);

  TicketCommentResponse updateComment(String commentId, TicketCommentUpdateRequest req);

  void deleteComment(String commentId);
  
  java.nio.file.Path getAttachmentPath(String ticketId, String attachmentId);
}
