package com.smartcampus.mapper;

import com.smartcampus.dto.response.NotificationResponse;
import com.smartcampus.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
  NotificationResponse toResponse(Notification entity);
}

