package com.smartcampus.util;

import com.smartcampus.config.AppProperties;
import com.smartcampus.exception.ConflictException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
@RequiredArgsConstructor
public class FileStorageService {

  private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
      "image/jpeg",
      "image/png",
      "image/webp"
  );

  private final AppProperties appProperties;

  public StoredFile storeTicketImage(String ticketId, MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ConflictException("Empty file upload");
    }
    if (file.getSize() > appProperties.fileMaxBytes()) {
      throw new ConflictException("File too large");
    }
    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
      throw new ConflictException("Unsupported file type");
    }

    String ext = switch (contentType) {
      case "image/jpeg" -> ".jpg";
      case "image/png" -> ".png";
      case "image/webp" -> ".webp";
      default -> "";
    };

    String storedName = UUID.randomUUID() + ext;
    Path root = Path.of(appProperties.fileStorageRoot()).toAbsolutePath().normalize();
    Path ticketDir = root.resolve("tickets").resolve(ticketId).normalize();
    if (!ticketDir.startsWith(root)) {
      throw new ConflictException("Invalid storage path");
    }

    try {
      Files.createDirectories(ticketDir);
      Path target = ticketDir.resolve(storedName).normalize();
      if (!target.startsWith(ticketDir)) {
        throw new ConflictException("Invalid file path");
      }
      Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
      return new StoredFile(file.getOriginalFilename(), storedName, contentType, file.getSize(), target.toString());
    } catch (IOException e) {
      throw new ConflictException("Failed to store file");
    }
  }

  public StoredFile storeAvatar(String userId, MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ConflictException("Empty file upload");
    }
    if (file.getSize() > appProperties.fileMaxBytes()) {
      throw new ConflictException("File too large");
    }
    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
      throw new ConflictException("Unsupported file type");
    }

    String ext = switch (contentType) {
      case "image/jpeg" -> ".jpg";
      case "image/png" -> ".png";
      case "image/webp" -> ".webp";
      default -> "";
    };

    String storedName = "avatar" + ext;
    Path root = Path.of(appProperties.fileStorageRoot()).toAbsolutePath().normalize();
    Path avatarDir = root.resolve("avatars").resolve(userId).normalize();
    if (!avatarDir.startsWith(root)) {
      throw new ConflictException("Invalid storage path");
    }

    try {
      Files.createDirectories(avatarDir);
      Path target = avatarDir.resolve(storedName).normalize();
      Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
      return new StoredFile(file.getOriginalFilename(), storedName, contentType, file.getSize(), target.toString());
    } catch (IOException e) {
      throw new ConflictException("Failed to store avatar");
    }
  }

  public record StoredFile(
      String originalFileName,
      String storedFileName,
      String contentType,
      long sizeBytes,
      String storagePath
  ) {}
}

