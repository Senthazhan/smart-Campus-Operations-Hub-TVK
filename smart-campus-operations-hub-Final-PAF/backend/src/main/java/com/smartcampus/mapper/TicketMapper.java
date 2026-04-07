package com.smartcampus.mapper;

import com.smartcampus.dto.response.TicketAttachmentResponse;
import com.smartcampus.dto.response.TicketCommentResponse;
import com.smartcampus.entity.TicketAttachment;
import com.smartcampus.entity.TicketComment;
import com.smartcampus.entity.Ticket;
import com.smartcampus.dto.response.TicketResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TicketMapper {

  @Mapping(target = "ticketId", source = "ticket.id")
  @Mapping(target = "uploadedBy", source = "uploadedBy.id")
  TicketAttachmentResponse toAttachmentResponse(TicketAttachment entity);

  @Mapping(target = "authorId", source = "author.id")
  @Mapping(target = "authorEmail", source = "author.email")
  TicketCommentResponse toCommentResponse(TicketComment entity);

  @Mapping(target = "resourceId", source = "resource.id")
  @Mapping(target = "createdBy", source = "createdBy.id")
  @Mapping(target = "createdByEmail", source = "createdBy.email")
  @Mapping(target = "assignedTechnicianId", source = "assignedTechnician.id")
  @Mapping(target = "assignedTechnicianEmail", source = "assignedTechnician.email")
  @Mapping(target = "attachments", ignore = true)
  @Mapping(target = "comments", ignore = true)
  @Mapping(target = "targetResolutionTime", ignore = true)
  @Mapping(target = "slaStatus", ignore = true)
  @Mapping(target = "createdByFullName", source = "createdBy.fullName")
  @Mapping(target = "assignedTechnicianName", source = "assignedTechnician.fullName")
  TicketResponse toResponse(Ticket entity);
}

