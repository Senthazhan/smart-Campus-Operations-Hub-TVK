package com.smartcampus.repository;

import com.smartcampus.entity.Role;
import com.smartcampus.enums.RoleName;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoleRepository extends MongoRepository<Role, String> {
  Optional<Role> findByName(RoleName name);
}

