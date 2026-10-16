package com.seettu.manager.service;

import com.seettu.manager.dto.KycVerificationRequest;
import com.seettu.manager.dto.UserKycResponse;
import com.seettu.manager.entity.User;
import com.seettu.manager.exception.DuplicateResourceException;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    @Transactional
    public User updateUser(Long id, String fullName, String phone, String preferredLanguage) {
        User user = getUserById(id);
        if (fullName != null) user.setFullName(fullName);
        if (phone != null) user.setPhone(phone);
        if (preferredLanguage != null) user.setPreferredLanguage(User.Language.valueOf(preferredLanguage));
        return userRepository.save(user);
    }

    /**
     * Sri Lankan NIC format validation:
     * - Old NIC: 9 digits followed by 'V' or 'X' (e.g., 951234567V)
     * - New NIC: 12 digits (e.g., 199512345678)
     */
    public boolean isValidSriLankanNic(String nic) {
        if (nic == null) return false;
        String clean = nic.trim().toUpperCase();
        return clean.matches("^[0-9]{9}[VX]$") || clean.matches("^[0-9]{12}$");
    }

    /**
     * Submit KYC details: validates NIC format, enforces uniqueness to prevent duplicate members/accounts,
     * stores Grama Niladhari Character Certificate proof, and transitions status to PENDING.
     */
    @Transactional
    public UserKycResponse submitKyc(Long userId, String nicNumber, MultipartFile file, String requestedRole) throws IOException {
        User user = getUserById(userId);

        if (nicNumber == null || nicNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("NIC Number is mandatory for member identity verification.");
        }

        String cleanNic = nicNumber.trim().toUpperCase();
        if (!isValidSriLankanNic(cleanNic)) {
            throw new IllegalArgumentException("Invalid Sri Lankan NIC number format. Please enter a valid 9-digit (ending in V or X) or 12-digit National Identity Card number.");
        }

        // Anti-Duplication Check: prevent multiple accounts or members registering the same NIC
        Optional<User> existingWithNic = userRepository.findByNicNumber(cleanNic);
        if (existingWithNic.isPresent() && !existingWithNic.get().getId().equals(userId)) {
            throw new DuplicateResourceException("This NIC number (" + cleanNic + ") is already registered to another member (" + existingWithNic.get().getFullName() + "). Duplicate member registration is strictly prohibited to prevent fraud.");
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Grama Niladhari Character Certificate file is required as proof of residency and identity.");
        }

        // Validate file type
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }
        if (!List.of(".jpg", ".jpeg", ".png", ".pdf").contains(extension)) {
            throw new IllegalArgumentException("Invalid document format. Please upload your Grama Niladhari Certificate as a JPG, PNG, or PDF file.");
        }

        // Save certificate file to ./uploads/kyc/
        Path kycDir = Paths.get(uploadDir, "kyc");
        if (!Files.exists(kycDir)) {
            Files.createDirectories(kycDir);
        }

        String newFileName = "gn_cert_user_" + userId + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path targetPath = kycDir.resolve(newFileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String fileUrl = "/uploads/kyc/" + newFileName;

        user.setNicNumber(cleanNic);
        user.setGnCertificateUrl(fileUrl);
        user.setKycStatus(User.KycStatus.PENDING);
        user.setKycRejectionReason(null);
        if (requestedRole != null && !requestedRole.trim().isEmpty()) {
            user.setRequestedRole(requestedRole.trim().toUpperCase());
        }
        user = userRepository.save(user);

        // Audit log
        String reqRoleMsg = "ORGANIZER".equalsIgnoreCase(user.getRequestedRole()) ? " (Requested role upgrade: ORGANIZER)" : "";
        auditLogService.log(user, "KYC_SUBMITTED", "users", user.getId(),
                "Member " + user.getFullName() + " submitted NIC (" + cleanNic + ") and Grama Niladhari certificate for verification" + reqRoleMsg + ".");

        return toKycResponse(user);
    }

    /**
     * Admin reviews and approves or rejects member KYC verification.
     */
    @Transactional
    public UserKycResponse verifyKyc(Long targetUserId, KycVerificationRequest request, User admin) {
        if (admin == null || admin.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException("Only System Administrators are authorized to verify member identities.");
        }

        User user = getUserById(targetUserId);

        String targetStatus = request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "";
        if (!targetStatus.equals("VERIFIED") && !targetStatus.equals("REJECTED")) {
            throw new IllegalArgumentException("Invalid verification status. Must be VERIFIED or REJECTED.");
        }

        if (targetStatus.equals("VERIFIED")) {
            user.setKycStatus(User.KycStatus.VERIFIED);
            user.setKycRejectionReason(null);
            user.setVerifiedBy(admin);
            user.setVerifiedAt(LocalDateTime.now());
            if ("ORGANIZER".equalsIgnoreCase(request.getRole())) {
                user.setRole(User.Role.ORGANIZER);
            }
            user = userRepository.save(user);

            String roleMsg = user.getRole() == User.Role.ORGANIZER ? " and promoted to Group Organizer" : "";
            auditLogService.log(admin, "MEMBER_KYC_VERIFIED", "users", targetUserId,
                    "Admin approved verification for " + user.getFullName() + " (NIC: " + user.getNicNumber() + ")" + roleMsg + ".");

            notificationService.sendNotification(user.getId(),
                    "Your identity and Grama Niladhari Certificate have been verified by System Admin!" + (user.getRole() == User.Role.ORGANIZER ? " You are now an authorized Group Organizer." : " You can now participate in Seettu groups."),
                    "KYC_VERIFIED");
        } else {
            String reason = request.getRejectionReason();
            if (reason == null || reason.trim().isEmpty()) {
                reason = "Grama Niladhari certificate proof does not match or is illegible. Please re-upload a clear copy.";
            }

            user.setKycStatus(User.KycStatus.REJECTED);
            user.setKycRejectionReason(reason.trim());
            user.setVerifiedBy(admin);
            user.setVerifiedAt(LocalDateTime.now());
            user = userRepository.save(user);

            auditLogService.log(admin, "MEMBER_KYC_REJECTED", "users", targetUserId,
                    "Admin rejected member verification for " + user.getFullName() + ". Reason: " + reason);

            notificationService.sendNotification(user.getId(),
                    "Your identity verification was rejected: " + reason,
                    "KYC_REJECTED");
        }

        return toKycResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserKycResponse> getPendingKycUsers() {
        return userRepository.findByKycStatusOrderByCreatedAtDesc(User.KycStatus.PENDING).stream()
                .map(this::toKycResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserKycResponse> getAllMembersWithKyc() {
        return userRepository.findByRole(User.Role.MEMBER).stream()
                .map(this::toKycResponse)
                .collect(Collectors.toList());
    }

    public UserKycResponse toKycResponse(User user) {
        User verifiedBy = user.getVerifiedBy();
        return UserKycResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .nicNumber(user.getNicNumber())
                .gnCertificateUrl(user.getGnCertificateUrl())
                .kycStatus(user.getKycStatus() != null ? user.getKycStatus().name() : "UNVERIFIED")
                .kycRejectionReason(user.getKycRejectionReason())
                .requestedRole(user.getRequestedRole())
                .verifiedById(verifiedBy != null ? verifiedBy.getId() : null)
                .verifiedByName(verifiedBy != null ? verifiedBy.getFullName() : null)
                .verifiedAt(user.getVerifiedAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public void lockUser(Long id) {
        User user = getUserById(id);
        user.setIsLocked(true);
        userRepository.save(user);
    }

    @Transactional
    public void unlockUser(Long id) {
        User user = getUserById(id);
        user.setIsLocked(false);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    @Transactional
    public void requestOrganizerRole(Long userId, Map<String, String> payload) {
        User user = getUserById(userId);
        user.setRequestedRole("ORGANIZER");
        userRepository.save(user);

        String note = (payload != null && payload.containsKey("message") && payload.get("message") != null)
                ? " Note: " + payload.get("message") : "";
        String location = (payload != null && payload.containsKey("district") && payload.get("district") != null)
                ? " (District: " + payload.get("district") + ")" : "";

        auditLogService.log(user, "ORGANIZER_REQUESTED", "users", user.getId(),
                "Member " + user.getFullName() + location + " applied to become a Group Organizer." + note);

        notificationService.sendNotification(user.getId(),
                "Your application to become a Seettu Organizer has been submitted. In accordance with The Cheetus Ordinance, our administration will verify your member credentials shortly.",
                "ORGANIZER_REQUEST_SUBMITTED");
    }
}
