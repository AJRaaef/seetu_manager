package com.seettu.manager.service;

import com.seettu.manager.dto.AdditionalDocumentResponse;
import com.seettu.manager.dto.VerificationRequest;
import com.seettu.manager.dto.VerificationResponse;
import com.seettu.manager.entity.MemberAdditionalDocument;
import com.seettu.manager.entity.MemberVerification;
import com.seettu.manager.entity.User;
import com.seettu.manager.entity.VerificationStatus;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.MemberAdditionalDocumentRepository;
import com.seettu.manager.repository.MemberVerificationRepository;
import com.seettu.manager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberVerificationService {

    private final MemberVerificationRepository verificationRepository;
    private final MemberAdditionalDocumentRepository additionalDocumentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public VerificationResponse submitVerification(Long userId,
                                                   VerificationRequest request,
                                                   MultipartFile nicFrontFile,
                                                   MultipartFile nicBackFile,
                                                   MultipartFile gnCertFile,
                                                   MultipartFile additionalDocFile) throws IOException {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Format and clean NIC number
        String nicNumber = request.getNicNumber().trim().toUpperCase();

        // Check NIC uniqueness against other users
        if (verificationRepository.existsByNicNumberAndUserIdNot(nicNumber, userId)) {
            throw new IllegalArgumentException("NIC Number " + nicNumber + " is already registered with another account.");
        }

        // Required file validation
        if (nicFrontFile == null || nicFrontFile.isEmpty()) {
            throw new IllegalArgumentException("NIC Front page image is required");
        }
        if (nicBackFile == null || nicBackFile.isEmpty()) {
            throw new IllegalArgumentException("NIC Back page image is required");
        }
        if (gnCertFile == null || gnCertFile.isEmpty()) {
            throw new IllegalArgumentException("Grama Niladhari Certificate image is required");
        }

        // Store primary verification documents
        String nicFrontPath = fileStorageService.storeFile(nicFrontFile, userId, FileStorageService.DocumentCategory.NIC_FRONT);
        String nicBackPath = fileStorageService.storeFile(nicBackFile, userId, FileStorageService.DocumentCategory.NIC_BACK);
        String gnCertPath = fileStorageService.storeFile(gnCertFile, userId, FileStorageService.DocumentCategory.GN_CERTIFICATE);

        // Check if user already submitted a verification record (e.g. re-submitting after REJECTED)
        Optional<MemberVerification> existingOpt = verificationRepository.findByUserId(userId);
        MemberVerification verification;

        if (existingOpt.isPresent()) {
            verification = existingOpt.get();
            // Delete old files if different
            fileStorageService.deleteFile(verification.getNicFrontImagePath());
            fileStorageService.deleteFile(verification.getNicBackImagePath());
            fileStorageService.deleteFile(verification.getGnCertificateImagePath());

            verification.setNicNumber(nicNumber);
            verification.setNicFrontImagePath(nicFrontPath);
            verification.setNicBackImagePath(nicBackPath);
            verification.setGnCertificateImagePath(gnCertPath);
            verification.setGnDivision(request.getGnDivision());
            verification.setGnIssueDate(request.getGnIssueDate());
            verification.setVerificationStatus(VerificationStatus.PENDING);
            verification.setRejectionReason(null);
            verification.setVerifiedBy(null);
            verification.setVerifiedAt(null);
        } else {
            verification = MemberVerification.builder()
                    .user(user)
                    .nicNumber(nicNumber)
                    .nicFrontImagePath(nicFrontPath)
                    .nicBackImagePath(nicBackPath)
                    .gnCertificateImagePath(gnCertPath)
                    .gnDivision(request.getGnDivision())
                    .gnIssueDate(request.getGnIssueDate())
                    .verificationStatus(VerificationStatus.PENDING)
                    .build();
        }

        verification = verificationRepository.save(verification);

        // Save optional additional document if provided
        if (additionalDocFile != null && !additionalDocFile.isEmpty()) {
            String addPath = fileStorageService.storeFile(additionalDocFile, userId, FileStorageService.DocumentCategory.ADDITIONAL);
            String docType = request.getAdditionalDocType() != null && !request.getAdditionalDocType().trim().isEmpty() 
                    ? request.getAdditionalDocType().trim() : "OTHER";
            String docName = request.getAdditionalDocName() != null && !request.getAdditionalDocName().trim().isEmpty()
                    ? request.getAdditionalDocName().trim() : additionalDocFile.getOriginalFilename();

            MemberAdditionalDocument additionalDoc = MemberAdditionalDocument.builder()
                    .verification(verification)
                    .documentType(docType)
                    .documentName(docName)
                    .documentImagePath(addPath)
                    .description(request.getAdditionalDocDescription())
                    .build();
            additionalDocumentRepository.save(additionalDoc);
            verification.addAdditionalDocument(additionalDoc);
        }

        // Sync with User table kycStatus & nicNumber
        user.setNicNumber(nicNumber);
        user.setKycStatus(User.KycStatus.PENDING);
        user.setGnCertificateUrl(gnCertPath);
        userRepository.save(user);

        // Audit Log
        auditLogService.log(
                user,
                "VERIFICATION_SUBMITTED",
                "member_verifications",
                verification.getId(),
                "Member submitted identity verification with NIC " + nicNumber
        );

        // Notify submitting Member
        try {
            notificationService.sendNotification(
                    user.getId(),
                    "Your identity verification (NIC: " + nicNumber + ") has been submitted successfully and is currently under review by administrators.",
                    "VERIFICATION_PENDING"
            );
        } catch (Exception e) {
            log.warn("Could not dispatch member submission notification: {}", e.getMessage());
        }

        // Notify all Organizers and Admins
        try {
            List<User> organizers = userRepository.findByRole(User.Role.ORGANIZER);
            List<User> admins = userRepository.findByRole(User.Role.ADMIN);
            List<User> reviewers = new ArrayList<>(organizers);
            reviewers.addAll(admins);

            for (User reviewer : reviewers) {
                notificationService.sendNotification(
                        reviewer.getId(),
                        "New Member Verification Submitted: " + user.getFullName() + " (NIC: " + nicNumber + ") is awaiting approval.",
                        "VERIFICATION_PENDING"
                );
            }
        } catch (Exception e) {
            log.warn("Could not dispatch reviewer verification notifications: {}", e.getMessage());
        }

        return mapToResponse(verification);
    }

    @Transactional(readOnly = true)
    public Optional<VerificationResponse> getVerificationByUserId(Long userId) {
        return verificationRepository.findByUserId(userId).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public VerificationResponse getVerificationById(Long id) {
        MemberVerification verification = verificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member verification not found with id: " + id));
        return mapToResponse(verification);
    }

    @Transactional(readOnly = true)
    public List<VerificationResponse> getPendingVerifications() {
        return verificationRepository.findByVerificationStatusOrderByCreatedAtDesc(VerificationStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VerificationResponse> getAllVerifications(VerificationStatus status, String search) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        List<MemberVerification> list;
        if (cleanSearch == null) {
            if (status == null) {
                list = verificationRepository.findAllByOrderByCreatedAtDesc();
            } else {
                list = verificationRepository.findByVerificationStatusOrderByCreatedAtDesc(status);
            }
        } else {
            list = verificationRepository.searchVerifications(status, cleanSearch);
        }
        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VerificationResponse verifyMember(Long verificationId, Long reviewerId) {
        MemberVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Member verification not found with id: " + verificationId));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer user not found with id: " + reviewerId));

        verification.setVerificationStatus(VerificationStatus.VERIFIED);
        verification.setVerifiedBy(reviewer);
        verification.setVerifiedAt(LocalDateTime.now());
        verification.setRejectionReason(null);
        MemberVerification saved = verificationRepository.save(verification);

        // Update User table
        User user = verification.getUser();
        user.setKycStatus(User.KycStatus.VERIFIED);
        user.setVerifiedBy(reviewer);
        user.setVerifiedAt(LocalDateTime.now());
        user.setKycRejectionReason(null);
        userRepository.save(user);

        // Audit Log
        auditLogService.log(
                reviewer,
                "VERIFICATION_APPROVED",
                "member_verifications",
                verification.getId(),
                "Approved member verification for " + user.getFullName() + " (NIC: " + verification.getNicNumber() + ")"
        );

        // Notify Member
        try {
            notificationService.sendNotification(
                    user.getId(),
                    "🎉 Congratulations! Your identity verification (NIC: " + verification.getNicNumber() + ") has been approved. You are now authorized to join Seettu circles.",
                    "VERIFICATION_APPROVED"
            );
        } catch (Exception e) {
            log.warn("Could not dispatch member approval notification: {}", e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Transactional
    public VerificationResponse rejectVerification(Long verificationId, Long reviewerId, String reason) {
        MemberVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Member verification not found with id: " + verificationId));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer user not found with id: " + reviewerId));

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason must be provided");
        }

        verification.setVerificationStatus(VerificationStatus.REJECTED);
        verification.setVerifiedBy(reviewer);
        verification.setVerifiedAt(LocalDateTime.now());
        verification.setRejectionReason(reason.trim());
        MemberVerification saved = verificationRepository.save(verification);

        // Update User table
        User user = verification.getUser();
        user.setKycStatus(User.KycStatus.REJECTED);
        user.setKycRejectionReason(reason.trim());
        userRepository.save(user);

        // Audit Log
        auditLogService.log(
                reviewer,
                "VERIFICATION_REJECTED",
                "member_verifications",
                verification.getId(),
                "Rejected member verification for " + user.getFullName() + ". Reason: " + reason.trim()
        );

        // Notify Member
        try {
            notificationService.sendNotification(
                    user.getId(),
                    "⚠️ Your identity verification was rejected: " + reason.trim() + ". Please re-submit clear documents.",
                    "VERIFICATION_REJECTED"
            );
        } catch (Exception e) {
            log.warn("Could not dispatch member rejection notification: {}", e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Transactional
    public AdditionalDocumentResponse uploadAdditionalDocument(Long verificationId,
                                                               Long userId,
                                                               String documentType,
                                                               String documentName,
                                                               String description,
                                                               MultipartFile file) throws IOException {

        MemberVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Member verification not found with id: " + verificationId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check ownership or admin/organizer
        boolean isOwner = verification.getUser().getId().equals(userId);
        boolean isPrivileged = user.getRole() == User.Role.ORGANIZER || user.getRole() == User.Role.ADMIN;
        if (!isOwner && !isPrivileged) {
            throw new SecurityException("You do not have permission to attach documents to this verification.");
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        String storedPath = fileStorageService.storeFile(file, verification.getUser().getId(), FileStorageService.DocumentCategory.ADDITIONAL);
        String name = (documentName != null && !documentName.trim().isEmpty()) 
                ? documentName.trim() : file.getOriginalFilename();
        String type = (documentType != null && !documentType.trim().isEmpty()) 
                ? documentType.trim() : "OTHER";

        MemberAdditionalDocument doc = MemberAdditionalDocument.builder()
                .verification(verification)
                .documentType(type)
                .documentName(name)
                .documentImagePath(storedPath)
                .description(description)
                .build();

        MemberAdditionalDocument saved = additionalDocumentRepository.save(doc);
        verification.addAdditionalDocument(saved);

        // Audit Log
        auditLogService.log(
                user,
                "DOCUMENT_ADDED",
                "member_additional_documents",
                saved.getId(),
                "Added supporting document '" + name + "' (" + type + ") to verification id " + verificationId
        );

        return mapAdditionalDocToResponse(saved);
    }

    @Transactional
    public void deleteAdditionalDocument(Long documentId, Long userId) {
        MemberAdditionalDocument doc = additionalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        MemberVerification verification = doc.getVerification();
        boolean isOwner = verification.getUser().getId().equals(userId);
        boolean isPrivileged = user.getRole() == User.Role.ORGANIZER || user.getRole() == User.Role.ADMIN;
        if (!isOwner && !isPrivileged) {
            throw new SecurityException("You do not have permission to delete this document.");
        }

        // Delete physical file
        fileStorageService.deleteFile(doc.getDocumentImagePath());

        verification.removeAdditionalDocument(doc);
        additionalDocumentRepository.delete(doc);

        // Audit Log
        auditLogService.log(
                user,
                "DOCUMENT_DELETED",
                "member_additional_documents",
                documentId,
                "Deleted supporting document '" + doc.getDocumentName() + "' from verification id " + verification.getId()
        );
    }

    @Transactional
    public void deleteVerification(Long id) {
        MemberVerification verification = verificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member verification not found with id: " + id));

        // Delete files
        fileStorageService.deleteFile(verification.getNicFrontImagePath());
        fileStorageService.deleteFile(verification.getNicBackImagePath());
        fileStorageService.deleteFile(verification.getGnCertificateImagePath());

        if (verification.getAdditionalDocuments() != null) {
            for (MemberAdditionalDocument doc : verification.getAdditionalDocuments()) {
                fileStorageService.deleteFile(doc.getDocumentImagePath());
            }
        }

        // Reset User kycStatus
        User user = verification.getUser();
        if (user != null) {
            user.setKycStatus(User.KycStatus.UNVERIFIED);
            user.setKycRejectionReason(null);
            userRepository.save(user);
        }

        verificationRepository.delete(verification);
    }

    public VerificationResponse mapToResponse(MemberVerification mv) {
        User user = mv.getUser();
        User verifier = mv.getVerifiedBy();

        List<AdditionalDocumentResponse> additionalDocs = mv.getAdditionalDocuments() != null
                ? mv.getAdditionalDocuments().stream().map(this::mapAdditionalDocToResponse).collect(Collectors.toList())
                : new ArrayList<>();

        return VerificationResponse.builder()
                .id(mv.getId())
                .userId(user != null ? user.getId() : null)
                .userName(user != null ? user.getFullName() : null)
                .userEmail(user != null ? user.getEmail() : null)
                .userPhone(user != null ? user.getPhone() : null)
                .nicNumber(mv.getNicNumber())
                .nicFrontImagePath(mv.getNicFrontImagePath())
                .nicBackImagePath(mv.getNicBackImagePath())
                .gnCertificateImagePath(mv.getGnCertificateImagePath())
                .gnDivision(mv.getGnDivision())
                .gnIssueDate(mv.getGnIssueDate())
                .verificationStatus(mv.getVerificationStatus())
                .verifiedById(verifier != null ? verifier.getId() : null)
                .verifiedByName(verifier != null ? verifier.getFullName() : null)
                .verifiedAt(mv.getVerifiedAt())
                .rejectionReason(mv.getRejectionReason())
                .createdAt(mv.getCreatedAt())
                .updatedAt(mv.getUpdatedAt())
                .additionalDocuments(additionalDocs)
                .build();
    }

    public AdditionalDocumentResponse mapAdditionalDocToResponse(MemberAdditionalDocument doc) {
        return AdditionalDocumentResponse.builder()
                .id(doc.getId())
                .verificationId(doc.getVerification() != null ? doc.getVerification().getId() : null)
                .documentType(doc.getDocumentType())
                .documentName(doc.getDocumentName())
                .documentImagePath(doc.getDocumentImagePath())
                .description(doc.getDescription())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
