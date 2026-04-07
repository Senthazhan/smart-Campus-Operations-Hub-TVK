package com.smartcampus.repository;

import com.smartcampus.entity.PasswordResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {

    Optional<PasswordResetToken> findByToken(String token);

    @Transactional
    void deleteByUserId(String userId);

    @Transactional
    void deleteByExpiresAtBefore(Instant now);
}
