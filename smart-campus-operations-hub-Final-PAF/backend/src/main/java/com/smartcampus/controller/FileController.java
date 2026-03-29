package com.smartcampus.controller;

import com.smartcampus.config.AppProperties;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

/**
 * FileController
 * ----------------
 * Handles file serving operations (e.g., user avatars).
 * 
 * Responsibilities:
 * - Securely retrieve files from server storage
 * - Prevent path traversal attacks
 * - Return correct content types for browser rendering
 * - Control caching behavior
 * 
 * Files are stored in the server file system under FILE_STORAGE_ROOT.
 */
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    // Application configuration (contains file storage root path)
    private final AppProperties appProperties;

    /**
     * Serve user avatar image.
     * 
     * Example:
     * GET /api/v1/files/avatars/{userId}/{fileName}
     * 
     * @param userId ID of the user
     * @param fileName name of the avatar file
     * @return image resource (PNG, JPG, WEBP)
     */
    @GetMapping("/avatars/{userId}/{fileName:.+}")
    public ResponseEntity<Resource> serveAvatar(
            @PathVariable String userId,
            @PathVariable String fileName) {

        try {
            // Resolve root directory safely
            Path root = Paths.get(appProperties.fileStorageRoot())
                    .toAbsolutePath()
                    .normalize();

            // Build file path: /root/avatars/{userId}/{fileName}
            Path filePath = root
                    .resolve("avatars")
                    .resolve(userId)
                    .resolve(fileName)
                    .normalize();

            /**
             * SECURITY CHECK:
             * Prevent path traversal attacks (e.g., ../../etc/passwd)
             */
            if (!filePath.startsWith(root)) {
                return ResponseEntity.notFound().build();
            }

            /**
             * Check if file exists and is readable
             */
            if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
                return ResponseEntity.notFound().build();
            }

            // Convert file path into Spring Resource
            Resource resource = new UrlResource(filePath.toUri());

            /**
             * Detect file content type dynamically
             */
            String contentType = Files.probeContentType(filePath);

            // Fallback content type detection
            if (contentType == null) {
                if (fileName.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (fileName.toLowerCase().endsWith(".webp")) {
                    contentType = "image/webp";
                } else {
                    contentType = "image/jpeg";
                }
            }

            /**
             * Return response with:
             * - Correct content type
             * - Cache control headers (disable caching)
             */
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CACHE_CONTROL,
                            "no-cache, no-store, must-revalidate")
                    .cacheControl(CacheControl.noCache())
                    .body(resource);

        } catch (IOException e) {
            // Internal server error if file reading fails
            return ResponseEntity.internalServerError().build();
        }
    }
}