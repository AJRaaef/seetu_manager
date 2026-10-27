package com.seettu.manager.controller;

import com.seettu.manager.dto.AdditionalDocumentResponse;
import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.dto.VerificationRejectRequest;
import com.seettu.manager.dto.VerificationRequest;
import com.seettu.manager.dto.VerificationResponse;
import com.seettu.manager.entity.User;
import com.seettu.manager.entity.VerificationStatus;
import com.seettu.manager.repository.MemberAdditionalDocumentRepository;
import com.seettu.manager.repository.MemberVerificationRepository;
import com.seettu.manager.service.FileStorageService;
import com.seettu.manager.service.MemberVerificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/verifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@Slf4j
public class MemberVerificationController {

    private final MemberVerificationService verificationService;
    private final FileStorageService fileStorageService;
    private final MemberVerificationRepository verificationRepository;
    private final MemberAdditionalDocumentRepository additionalDocumentRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<VerificationResponse>> submitVerification(
            @RequestParam("nicNumber") String nicNumber,
            @RequestParam(value = "gnDivision", required = false) String gnDivision,
            @RequestParam(value = "gnIssueDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate gnIssueDate,
            @RequestParam("nicFront") MultipartFile nicFrontFile,
            @RequestParam("nicBack") MultipartFile nicBackFile,
            @RequestParam("gnCert") MultipartFile gnCertFile,
            @RequestParam(value = "additionalDoc", required = false) MultipartFile additionalDocFile,
            @RequestParam(value = "additionalDocType", required = false) String additionalDocType,
            @RequestParam(value = "additionalDocName", required = false) String additionalDocName,
            @RequestParam(value = "additionalDocDescription", required = false) String additionalDocDescription,
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @AuthenticationPrincipal User authUser) throws IOException {

        Long effectiveUserId = paramUserId != null ? paramUserId : (authUser != null ? authUser.getId() : null);
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to submit verification."));
        }

        // NIC regex validation: 9 digits + V/X or 12 digits
        String cleanedNic = nicNumber != null ? nicNumber.trim().toUpperCase() : "";
        if (!cleanedNic.matches("^([0-9]{9}[VX]|[0-9]{12})$")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid NIC Number format. Must be 9 digits ending in V or X, or modern 12 digits."));
        }

        VerificationRequest req = VerificationRequest.builder()
                .nicNumber(cleanedNic)
                .gnDivision(gnDivision != null ? gnDivision.trim() : null)
                .gnIssueDate(gnIssueDate)
                .additionalDocType(additionalDocType)
                .additionalDocName(additionalDocName)
                .additionalDocDescription(additionalDocDescription)
                .build();

        VerificationResponse response = verificationService.submitVerification(
                effectiveUserId, req, nicFrontFile, nicBackFile, gnCertFile, additionalDocFile
        );

        return ResponseEntity.ok(ApiResponse.success("Member verification submitted successfully", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<VerificationResponse>> getMyVerification(
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @AuthenticationPrincipal User authUser) {

        Long effectiveUserId = paramUserId != null ? paramUserId : (authUser != null ? authUser.getId() : null);
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required."));
        }

        Optional<VerificationResponse> verificationOpt = verificationService.getVerificationByUserId(effectiveUserId);
        return verificationOpt
                .map(verificationResponse -> ResponseEntity.ok(ApiResponse.success(verificationResponse)))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.success(null)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VerificationResponse>> getVerificationById(
            @PathVariable Long id,
            @AuthenticationPrincipal User authUser) {

        VerificationResponse response = verificationService.getVerificationById(id);

        // Security check: only document owner, organizer or admin can view
        if (authUser != null && authUser.getRole() == User.Role.MEMBER && !response.getUserId().equals(authUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You are not authorized to view this verification."));
        }

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<VerificationResponse>>> getPendingVerifications(
            @RequestParam(value = "status", required = false) String statusStr,
            @RequestParam(value = "search", required = false) String search) {

        VerificationStatus filterStatus = null;
        if (statusStr != null && !statusStr.trim().isEmpty() && !statusStr.equalsIgnoreCase("ALL")) {
            try {
                filterStatus = VerificationStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        List<VerificationResponse> list;
        if (filterStatus != null || (search != null && !search.trim().isEmpty())) {
            list = verificationService.getAllVerifications(filterStatus, search);
        } else {
            // Default to all verifications for the management portal
            list = verificationService.getAllVerifications(null, null);
        }

        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<VerificationResponse>> approveVerification(
            @PathVariable Long id,
            @RequestParam(value = "reviewerId", required = false) Long paramReviewerId,
            @AuthenticationPrincipal User authUser) {

        Long effectiveReviewerId = paramReviewerId != null ? paramReviewerId : (authUser != null ? authUser.getId() : null);
        if (effectiveReviewerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Reviewer identity required"));
        }

        VerificationResponse response = verificationService.verifyMember(id, effectiveReviewerId);
        return ResponseEntity.ok(ApiResponse.success("Member verification approved successfully", response));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<VerificationResponse>> rejectVerification(
            @PathVariable Long id,
            @RequestBody @Valid VerificationRejectRequest request,
            @RequestParam(value = "reviewerId", required = false) Long paramReviewerId,
            @AuthenticationPrincipal User authUser) {

        Long effectiveReviewerId = paramReviewerId != null ? paramReviewerId : (authUser != null ? authUser.getId() : null);
        if (effectiveReviewerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Reviewer identity required"));
        }

        VerificationResponse response = verificationService.rejectVerification(id, effectiveReviewerId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success("Member verification rejected", response));
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AdditionalDocumentResponse>> uploadAdditionalDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", required = false) String documentType,
            @RequestParam(value = "documentName", required = false) String documentName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @AuthenticationPrincipal User authUser) throws IOException {

        Long effectiveUserId = paramUserId != null ? paramUserId : (authUser != null ? authUser.getId() : null);
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }

        AdditionalDocumentResponse response = verificationService.uploadAdditionalDocument(
                id, effectiveUserId, documentType, documentName, description, file
        );
        return ResponseEntity.ok(ApiResponse.success("Additional document uploaded successfully", response));
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAdditionalDocument(
            @PathVariable Long documentId,
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @AuthenticationPrincipal User authUser) {

        Long effectiveUserId = paramUserId != null ? paramUserId : (authUser != null ? authUser.getId() : null);
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }

        verificationService.deleteAdditionalDocument(documentId, effectiveUserId);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }

    @GetMapping(value = {"/files", "/files/**"})
    public ResponseEntity<Resource> getVerificationFile(
            @RequestParam(value = "path", required = false) String queryPath,
            HttpServletRequest request,
            @AuthenticationPrincipal User authUser) {

        try {
            String filePath = queryPath;
            if (filePath == null || filePath.trim().isEmpty()) {
                // Extract from URI pattern /api/verifications/files/...
                String requestUri = request.getRequestURI();
                String prefix = "/api/verifications/files/";
                int idx = requestUri.indexOf(prefix);
                if (idx >= 0) {
                    filePath = requestUri.substring(idx + prefix.length());
                }
            }

            if (filePath == null || filePath.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Security check: restrict file access to owner, organizers, or admins
            if (authUser != null && authUser.getRole() == User.Role.MEMBER) {
                // If member, check if the file belongs to this member
                Long authUserId = authUser.getId();
                // Check filename starts with userId or matches member's verification record
                String cleanName = filePath.substring(filePath.lastIndexOf('/') + 1);
                boolean matchesPrefix = cleanName.startsWith(authUserId + "-");
                if (!matchesPrefix) {
                    boolean ownsRecord = verificationRepository.findByUserId(authUserId)
                            .map(v -> (v.getNicFrontImagePath() != null && v.getNicFrontImagePath().contains(cleanName))
                                    || (v.getNicBackImagePath() != null && v.getNicBackImagePath().contains(cleanName))
                                    || (v.getGnCertificateImagePath() != null && v.getGnCertificateImagePath().contains(cleanName)))
                            .orElse(false);

                    if (!ownsRecord) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                }
            }

            Resource resource = fileStorageService.loadFileAsResource(filePath);
            MediaType mediaType = MediaTypeFactory.getMediaType(resource)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("Could not load verification file: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
