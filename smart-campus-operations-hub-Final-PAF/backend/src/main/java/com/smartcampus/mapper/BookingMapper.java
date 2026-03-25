package com.smartcampus.mapper;

import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookingMapper {
  @Mapping(target = "resourceId", source = "resource.id")
  @Mapping(target = "resourceName", source = "resource.name")
  @Mapping(target = "resourceCode", source = "resource.resourceCode")
  @Mapping(target = "userId", source = "user.id")
  @Mapping(target = "userEmail", source = "user.email")
  @Mapping(target = "decidedBy", source = "decidedBy.id")
  BookingResponse toResponse(Booking entity);
}

