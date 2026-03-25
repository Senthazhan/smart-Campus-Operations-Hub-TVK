package com.smartcampus.mapper;

import com.smartcampus.dto.response.AdminUserResponse;
import com.smartcampus.dto.response.MeResponse;
import com.smartcampus.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

  @Mapping(
      target = "role",
      expression = "java(user.getRole() != null && user.getRole().getName() != null ? user.getRole().getName() : com.smartcampus.enums.RoleName.USER)"
  )
  MeResponse toMeResponse(User user);

  @Mapping(
      target = "role",
      expression = "java(user.getRole() != null && user.getRole().getName() != null ? user.getRole().getName() : com.smartcampus.enums.RoleName.USER)"
  )
  AdminUserResponse toAdminUserResponse(User user);
}