package com.seettu.manager.service;

import com.seettu.manager.dto.AuthResponse;
import com.seettu.manager.dto.LoginRequest;
import com.seettu.manager.dto.OrganizerApplicationRequest;
import com.seettu.manager.dto.RegisterRequest;
import com.seettu.manager.entity.User;
import com.seettu.manager.exception.DuplicateResourceException;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.exception.UnauthorizedException;
import com.seettu.manager.repository.UserRepository;
import com.seettu.manager.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final AuditLogService auditLogService;

    private static final int MAX_FAILED_ATTEMPTS = 5;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number already registered: " + request.getPhone());
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // All registered users start as MEMBER. To prevent fraud, organizer privileges require Admin verification.
        User.Role role = User.Role.MEMBER;

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .requestedRole(request.getRequestedRole() != null && !request.getRequestedRole().trim().isEmpty() ? request.getRequestedRole().trim().toUpperCase() : null)
                .preferredLanguage(User.Language.valueOf(request.getPreferredLanguage()))
                .isLocked(false)
                .failedLoginAttempts(0)
                .build();

        user = userRepository.save(user);
        String reqRoleMsg = user.getRequestedRole() != null ? " (Requested role: " + user.getRequestedRole() + ")" : "";
        auditLogService.log(user, "USER_REGISTERED", "users", user.getId(), "New user registered: " + user.getEmail() + reqRoleMsg);

        String token = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .preferredLanguage(user.getPreferredLanguage().name())
                .nicNumber(user.getNicNumber())
                .kycStatus(user.getKycStatus() != null ? user.getKycStatus().name() : "UNVERIFIED")
                .gnCertificateUrl(user.getGnCertificateUrl())
                .kycRejectionReason(user.getKycRejectionReason())
                .requestedRole(user.getRequestedRole())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (user.getIsLocked()) {
            throw new UnauthorizedException("Account is locked due to too many failed login attempts. Please contact admin.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            handleFailedLogin(user);
            throw new BadCredentialsException("Invalid email or password");
        }

        // Reset failed attempts on successful login
        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        auditLogService.log(user, "USER_LOGIN", "users", user.getId(), "User logged in: " + user.getEmail());

        String token = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .preferredLanguage(user.getPreferredLanguage().name())
                .nicNumber(user.getNicNumber())
                .kycStatus(user.getKycStatus() != null ? user.getKycStatus().name() : "UNVERIFIED")
                .gnCertificateUrl(user.getGnCertificateUrl())
                .kycRejectionReason(user.getKycRejectionReason())
                .requestedRole(user.getRequestedRole())
                .build();
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // In production, generate a token and send email
        // For development, just log to console
        String resetToken = java.util.UUID.randomUUID().toString();
        System.out.println("=== PASSWORD RESET TOKEN ===");
        System.out.println("Email: " + email);
        System.out.println("Token: " + resetToken);
        System.out.println("============================");

        auditLogService.log(user, "FORGOT_PASSWORD", "users", user.getId(), "Password reset requested for: " + email);
    }

    @Transactional
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setFailedLoginAttempts(0);
        user.setIsLocked(false);
        userRepository.save(user);

        auditLogService.log(user, "PASSWORD_RESET", "users", user.getId(), "Password reset for: " + email);
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        auditLogService.log(user, "PASSWORD_CHANGED", "users", user.getId(), "Password changed for: " + user.getEmail());
    }

    @Transactional
    public Map<String, Object> applyOrganizer(OrganizerApplicationRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim())
                .or(() -> userRepository.findByPhone(request.getPhone().trim()))
                .orElse(null);

        String fullAddress = (request.getAddressLine1() != null ? request.getAddressLine1().trim() : "")
                + (request.getAddressLine2() != null && !request.getAddressLine2().trim().isEmpty() ? ", " + request.getAddressLine2().trim() : "")
                + (request.getPostalCode() != null && !request.getPostalCode().trim().isEmpty() ? " " + request.getPostalCode().trim() : "");

        String districtStr = (request.getDistrict() != null && !request.getDistrict().trim().isEmpty())
                ? request.getDistrict().trim() : "";
        String msgStr = (request.getMessage() != null && !request.getMessage().trim().isEmpty())
                ? request.getMessage().trim() : "";

        if (user != null) {
            user.setRequestedRole("ORGANIZER");
            user.setKycStatus(User.KycStatus.PENDING);
            if (!districtStr.isEmpty()) user.setDistrict(districtStr);
            if (!fullAddress.isEmpty()) user.setAddress(fullAddress);
            if (!msgStr.isEmpty()) user.setOrganizerApplicationNote(msgStr);
            user = userRepository.save(user);

            auditLogService.log(user, "ORGANIZER_APPLIED", "users", user.getId(),
                    "Applicant/Member " + user.getFullName() + " (" + districtStr + ") submitted application to become an Organizer. Message: " + msgStr);
        } else {
            user = User.builder()
                    .fullName(request.getFullName().trim())
                    .email(request.getEmail().trim())
                    .phone(request.getPhone().trim())
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(User.Role.MEMBER)
                    .requestedRole("ORGANIZER")
                    .preferredLanguage(User.Language.EN)
                    .kycStatus(User.KycStatus.PENDING)
                    .district(districtStr)
                    .address(fullAddress)
                    .organizerApplicationNote(msgStr)
                    .isLocked(false)
                    .failedLoginAttempts(0)
                    .build();

            user = userRepository.save(user);

            auditLogService.log(user, "ORGANIZER_APPLIED", "users", user.getId(),
                    "New Organizer application received from " + user.getFullName() + " (" + user.getEmail() + ", " + user.getPhone() + ", " + districtStr + "). Message: " + msgStr);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("applicationId", "SEETTU-ORG-" + String.format("%05d", user.getId()));
        resp.put("userId", user.getId());
        resp.put("fullName", user.getFullName());
        resp.put("email", user.getEmail());
        resp.put("phone", user.getPhone());
        resp.put("district", user.getDistrict());
        resp.put("status", "PENDING");
        resp.put("submittedAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : LocalDateTime.now().toString());
        return resp;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getApplicationStatus(String query) {
        if (query == null || query.trim().isEmpty()) {
            throw new IllegalArgumentException("Email or phone number is required to look up application status.");
        }
        String cleanQuery = query.trim();
        User user = userRepository.findByEmail(cleanQuery)
                .or(() -> userRepository.findByPhone(cleanQuery))
                .orElseThrow(() -> new ResourceNotFoundException("No organizer application found for: " + cleanQuery));

        Map<String, Object> resp = new HashMap<>();
        resp.put("applicationId", "SEETTU-ORG-" + String.format("%05d", user.getId()));
        resp.put("userId", user.getId());
        resp.put("fullName", user.getFullName());
        resp.put("email", user.getEmail());
        resp.put("phone", user.getPhone());
        resp.put("district", user.getDistrict());
        resp.put("address", user.getAddress());
        resp.put("role", user.getRole().name());
        resp.put("requestedRole", user.getRequestedRole());
        resp.put("kycStatus", user.getKycStatus() != null ? user.getKycStatus().name() : "PENDING");
        resp.put("rejectionReason", user.getKycRejectionReason());
        resp.put("isApprovedAsOrganizer", user.getRole() == User.Role.ORGANIZER);
        resp.put("submittedAt", user.getCreatedAt());

        if (user.getRole() == User.Role.ORGANIZER) {
            resp.put("status", "APPROVED");
            resp.put("statusMessage", "Congratulations! Your application has been approved by our Administration. You are an authorized Seettu Organizer.");
        } else if (user.getKycStatus() == User.KycStatus.REJECTED) {
            resp.put("status", "REJECTED");
            resp.put("statusMessage", "Application review was not approved: " + (user.getKycRejectionReason() != null ? user.getKycRejectionReason() : "Please contact regional desk."));
        } else {
            resp.put("status", "PENDING");
            resp.put("statusMessage", "Your application is currently under administrative compliance review. Our regional desk officer will contact you shortly.");
        }
        return resp;
    }

    @Transactional
    public AuthResponse activateOrganizer(String query, String password) {
        if (query == null || query.trim().isEmpty() || password == null || password.length() < 6) {
            throw new IllegalArgumentException("Valid credentials and a password of at least 6 characters are required.");
        }
        String cleanQuery = query.trim();
        User user = userRepository.findByEmail(cleanQuery)
                .or(() -> userRepository.findByPhone(cleanQuery))
                .orElseThrow(() -> new ResourceNotFoundException("No application found for: " + cleanQuery));

        if (user.getRole() != User.Role.ORGANIZER) {
            throw new IllegalArgumentException("Your application is still under review (" + user.getKycStatus() + "). Account activation unlocks upon administrator approval.");
        }

        user.setPasswordHash(passwordEncoder.encode(password));
        user.setIsLocked(false);
        user.setFailedLoginAttempts(0);
        user = userRepository.save(user);

        auditLogService.log(user, "ORGANIZER_ACTIVATED", "users", user.getId(),
                "Approved Organizer " + user.getFullName() + " activated password and launched Organizer Portal.");

        String token = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .preferredLanguage(user.getPreferredLanguage().name())
                .nicNumber(user.getNicNumber())
                .kycStatus(user.getKycStatus() != null ? user.getKycStatus().name() : "VERIFIED")
                .requestedRole(user.getRequestedRole())
                .build();
    }

    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setIsLocked(true);
            auditLogService.log(user, "ACCOUNT_LOCKED", "users", user.getId(),
                    "Account locked after " + MAX_FAILED_ATTEMPTS + " failed attempts: " + user.getEmail());
        }
        userRepository.save(user);
    }
}
