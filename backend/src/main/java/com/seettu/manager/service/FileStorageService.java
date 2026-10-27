package com.seettu.manager.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    public enum DocumentCategory {
        NIC_FRONT("nic/front"),
        NIC_BACK("nic/back"),
        GN_CERTIFICATE("gn"),
        ADDITIONAL("additional");

        private final String subDir;

        DocumentCategory(String subDir) {
            this.subDir = subDir;
        }

        public String getSubDir() {
            return subDir;
        }
    }

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf"
    );
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".jpg",
            ".jpeg",
            ".png",
            ".pdf"
    );

    private final Path rootVerificationLocation;

    public FileStorageService(@Value("${file.verification.dir:./uploads/verifications}") String verificationDir) {
        this.rootVerificationLocation = Paths.get(verificationDir).toAbsolutePath().normalize();
        initDirectories();
    }

    private void initDirectories() {
        try {
            Files.createDirectories(this.rootVerificationLocation);
            for (DocumentCategory cat : DocumentCategory.values()) {
                Path subPath = this.rootVerificationLocation.resolve(cat.getSubDir());
                Files.createDirectories(subPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize verification file storage folders", e);
        }
    }

    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 5MB limit. Please upload a smaller file.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file format. Allowed formats are JPEG, PNG, or PDF. Detected: " + contentType);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid filename.");
        }

        String lowerName = originalFilename.toLowerCase();
        boolean validExt = ALLOWED_EXTENSIONS.stream().anyMatch(lowerName::endsWith);
        if (!validExt) {
            throw new IllegalArgumentException("File extension not permitted. Allowed extensions are .jpg, .jpeg, .png, .pdf");
        }
    }

    public String storeFile(MultipartFile file, Long userId, DocumentCategory category) throws IOException {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        int dotIndex = originalFilename != null ? originalFilename.lastIndexOf('.') : -1;
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        } else {
            extension = ".jpg";
        }

        // Format: {userId}-{timestamp}-{randomSuffix}.{ext}
        long timestamp = System.currentTimeMillis();
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6);
        String filename = String.format("%d-%d-%s%s", userId, timestamp, randomSuffix, extension);

        Path categoryDir = this.rootVerificationLocation.resolve(category.getSubDir());
        if (!Files.exists(categoryDir)) {
            Files.createDirectories(categoryDir);
        }

        Path destinationFile = categoryDir.resolve(filename).normalize().toAbsolutePath();
        // Security check: ensure file does not escape categoryDir
        if (!destinationFile.getParent().equals(categoryDir.toAbsolutePath())) {
            throw new SecurityException("Cannot store file outside target directory");
        }

        Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);
        log.info("Saved verification file: category={}, path={}", category, destinationFile);

        // Return relative path starting with /uploads/verifications/...
        return "/uploads/verifications/" + category.getSubDir() + "/" + filename;
    }

    public Resource loadFileAsResource(String filePath) throws MalformedURLException, FileNotFoundException {
        if (filePath == null || filePath.trim().isEmpty()) {
            throw new FileNotFoundException("File path is empty");
        }

        // Clean relative path prefix if present
        String relative = filePath;
        if (relative.startsWith("/uploads/verifications/")) {
            relative = relative.substring("/uploads/verifications/".length());
        } else if (relative.startsWith("uploads/verifications/")) {
            relative = relative.substring("uploads/verifications/".length());
        } else if (relative.startsWith("/")) {
            relative = relative.substring(1);
        }

        Path resolved = this.rootVerificationLocation.resolve(relative).normalize().toAbsolutePath();

        // Verify the file is strictly inside rootVerificationLocation
        if (!resolved.startsWith(this.rootVerificationLocation)) {
            throw new SecurityException("Cannot access file outside verification storage folder");
        }

        Resource resource = new UrlResource(resolved.toUri());
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new FileNotFoundException("File not found: " + filePath);
        }
    }

    public void deleteFile(String filePath) {
        if (filePath == null || filePath.trim().isEmpty()) {
            return;
        }
        try {
            String relative = filePath;
            if (relative.startsWith("/uploads/verifications/")) {
                relative = relative.substring("/uploads/verifications/".length());
            } else if (relative.startsWith("uploads/verifications/")) {
                relative = relative.substring("uploads/verifications/".length());
            }
            Path resolved = this.rootVerificationLocation.resolve(relative).normalize().toAbsolutePath();
            if (resolved.startsWith(this.rootVerificationLocation)) {
                Files.deleteIfExists(resolved);
                log.info("Deleted verification file: {}", resolved);
            }
        } catch (Exception e) {
            log.warn("Could not delete file {}: {}", filePath, e.getMessage());
        }
    }
}
