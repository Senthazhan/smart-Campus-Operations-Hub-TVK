package com.smartcampus.repository;

import com.smartcampus.entity.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface UserRepository extends MongoRepository<User, String> {
  Optional<User> findByEmail(String email);

  Optional<User> findByUsername(String username);

  Optional<User> findByUsernameOrEmail(String username, String email);

  boolean existsByUsername(String username);

  boolean existsByEmail(String email);

  java.util.List<User> findAllByRole(com.smartcampus.entity.Role role);
  
  org.springframework.data.domain.Page<User> findByRole(com.smartcampus.entity.Role role, org.springframework.data.domain.Pageable pageable);

  Optional<com.smartcampus.entity.User> findByProviderAndProviderSubject(String provider, String providerSubject);

  @Query("{ '$or': [ { 'fullName': { '$regex': ?0, '$options': 'i' } }, { 'email': { '$regex': ?1, '$options': 'i' } }, { 'username': { '$regex': ?2, '$options': 'i' } } ] }")
  org.springframework.data.domain.Page<User> search(String fullName, String email, String username, org.springframework.data.domain.Pageable pageable);

  @Query("{ 'role': ?0, '$or': [ { 'fullName': { '$regex': ?1, '$options': 'i' } }, { 'email': { '$regex': ?2, '$options': 'i' } }, { 'username': { '$regex': ?3, '$options': 'i' } } ] }")
  org.springframework.data.domain.Page<User> searchWithRole(com.smartcampus.entity.Role role, String fullName, String email, String username, org.springframework.data.domain.Pageable pageable);
}
