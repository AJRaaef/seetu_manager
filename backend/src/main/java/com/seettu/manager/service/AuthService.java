package com.seettu.manager.service;

import com.seettu.manager.dto.AuthResponse;
import com.seettu.manager.dto.LoginRequest;
import com.seettu.manager.dto.RegisterRequest;
import com.seettu.manager.entity.User;
import com.seettu.manager.exception.DuplicateResourceException;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.exception.UnauthorizedException;
import com.seettu.manager.repository.UserRepository;
import com.seettu.manager.security.JwtUtil;
import lombok.RequiredArgsConstructor;
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

        User.Role role = (request.getRole() != null && !request.getRole().isBlank()) 
                ? User.Role.valueOf(request.getRole()) 
                : User.Role.MEMBER;

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .preferredLanguage(User.Language.valueOf(request.getPreferredLanguage()))
                .isLocked(false)
                .failedLoginAttempts(0)
                .build();

        user = userRepository.save(user);
        auditLogService.log(user, "USER_REGISTERED", "users", user.getId(), "New user registered: " + user.getEmail());

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
