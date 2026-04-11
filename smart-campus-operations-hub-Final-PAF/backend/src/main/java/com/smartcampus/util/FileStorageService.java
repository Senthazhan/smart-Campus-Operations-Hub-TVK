package com.smartcampus.util;

import com.smartcampus.config.AppProperties;
import com.smartcampus.exception.ConflictException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;
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

  public StoredFile storeResourceImage(String resourceId, MultipartFile file) {
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

    String storedName = "resource" + ext;
    Path root = Path.of(appProperties.fileStorageRoot()).toAbsolutePath().normalize();
    Path resourceDir = root.resolve("resources").resolve(resourceId).normalize();
    if (!resourceDir.startsWith(root)) {
      throw new ConflictException("Invalid storage path");
    }

    try {
      Files.createDirectories(resourceDir);
      Path target = resourceDir.resolve(storedName).normalize();
      Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
      return new StoredFile(file.getOriginalFilename(), storedName, contentType, file.getSize(), target.toString());
    } catch (IOException e) {
      throw new ConflictException("Failed to store resource image");
    }
  }

  public record StoredFile(
      String originalFileName,
      String storedFileName,
      String contentType,
      long sizeBytes,
      String storagePath
  ) {}

  private static boolean isPdf(MultipartFile file) {
    String ct = file.getContentType();
    if (ct != null && ct.equalsIgnoreCase("application/pdf")) {
      return true;
    }
    String name = file.getOriginalFilename();
    return name != null && name.toLowerCase().endsWith(".pdf");
  }

  public StoredFile storeEbookPdf(String ebookId, MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ConflictException("Empty file upload");
    }
    if (file.getSize() > appProperties.fileMaxBytes()) {
      throw new ConflictException("File too large");
    }
    if (!isPdf(file)) {
      throw new ConflictException("Only PDF files are allowed");
    }
    String storedName = "ebook.pdf";
    Path root = Path.of(appProperties.fileStorageRoot()).toAbsolutePath().normalize();
    Path dir = root.resolve("ebooks").resolve(ebookId).normalize();
    if (!dir.startsWith(root)) {
      throw new ConflictException("Invalid storage path");
    }
    try {
      Files.createDirectories(dir);
      Path target = dir.resolve(storedName).normalize();
      if (!target.startsWith(dir)) {
        throw new ConflictException("Invalid file path");
      }
      Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
      return new StoredFile(file.getOriginalFilename(), storedName, "application/pdf", file.getSize(), target.toString());
    } catch (IOException e) {
      throw new ConflictException("Failed to store e-book file");
    }
  }

  public StoredFile storeEbookSubmissionPdf(String submissionId, MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ConflictException("Empty file upload");
    }
    if (file.getSize() > appProperties.fileMaxBytes()) {
      throw new ConflictException("File too large");
    }
    if (!isPdf(file)) {
      throw new ConflictException("Only PDF files are allowed");
    }
    String storedName = "submission.pdf";
    Path root = Path.of(appProperties.fileStorageRoot()).toAbsolutePath().normalize();
    Path dir = root.resolve("ebooks").resolve("submissions").resolve(submissionId).normalize();
    if (!dir.startsWith(root)) {
      throw new ConflictException("Invalid storage path");
    }
    try {
      Files.createDirectories(dir);
      Path target = dir.resolve(storedName).normalize();
      if (!target.startsWith(dir)) {
        throw new ConflictException("Invalid file path");
      }
      Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
      return new StoredFile(file.getOriginalFilename(), storedName, "application/pdf", file.getSize(), target.toString());
    } catch (IOException e) {
      throw new ConflictException("Failed to store submission file");
    }
  }

  public Path resolveEbookFile(String ebookId, String storedFileName) {
    Path root = Path.of(appProperties.fileStorageRoot()).toAbsolutePath().normalize();
    Path filePath = root.resolve("ebooks").resolve(ebookId).resolve(storedFileName).normalize();
    if (!filePath.startsWith(root)) {
      throw new ConflictException("Invalid path");
    }
    return filePath;
  }

  public Path resolveEbookSubmissionFile(String submissionId, String storedFileName) {
    Path root = Path.of(appProperties.fileStorageRoot()).toAbsolutePath().normalize();
    Path filePath = root.resolve("ebooks").resolve("submissions").resolve(submissionId).resolve(storedFileName).normalize();
    if (!filePath.startsWith(root)) {
      throw new ConflictException("Invalid path");
    }
    return filePath;
  }

  public void copyEbookSubmissionToLibrary(String submissionId, String submissionStoredName, String newEbookId) throws IOException {
    Path root = Path.of(appProperties.fileStorageRoot()).toAbsolutePath().normalize();
    Path source = root.resolve("ebooks").resolve("submissions").resolve(submissionId).resolve(submissionStoredName).normalize();
    Path destDir = root.resolve("ebooks").resolve(newEbookId).normalize();
    if (!source.startsWith(root) || !destDir.startsWith(root)) {
      throw new ConflictException("Invalid path");
    }
    Files.createDirectories(destDir);
    Path dest = destDir.resolve("ebook.pdf").normalize();
    if (!dest.startsWith(destDir)) {
      throw new ConflictException("Invalid path");
    }
    Files.copy(source, dest, StandardCopyOption.REPLACE_EXISTING);
  }

  public void deleteEbookDirectory(String ebookId) {
    Path root = Path.of(appProperties.fileStorageRoot()).toAbsolutePath().normalize();
    Path dir = root.resolve("ebooks").resolve(ebookId).normalize();
    if (!dir.startsWith(root)) {
      throw new ConflictException("Invalid path");
    }
    deleteTree(dir);
  }

  public void deleteEbookSubmissionDirectory(String submissionId) {
    Path root = Path.of(appProperties.fileStorageRoot()).toAbsolutePath().normalize();
    Path dir = root.resolve("ebooks").resolve("submissions").resolve(submissionId).normalize();
    if (!dir.startsWith(root)) {
      throw new ConflictException("Invalid path");
    }
    deleteTree(dir);
  }

  private void deleteTree(Path rootDir) {
    if (!Files.exists(rootDir)) {
      return;
    }
    try (Stream<Path> walk = Files.walk(rootDir)) {
      walk.sorted(Comparator.reverseOrder()).forEach(p -> {
        try {
          Files.deleteIfExists(p);
        } catch (IOException e) {
          throw new ConflictException("Failed to delete stored files");
        }
      });
    } catch (IOException e) {
      throw new ConflictException("Failed to delete stored files");
    }
  }
}

