package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.dto.AuthResponse;
import com.seettu.manager.dto.LoginRequest;
import com.seettu.manager.dto.OrganizerApplicationRequest;
import com.seettu.manager.dto.RegisterRequest;
import com.seettu.manager.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/apply-organizer")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> applyOrganizer(@Valid @RequestBody OrganizerApplicationRequest request) {
        java.util.Map<String, Object> application = authService.applyOrganizer(request);
        return ResponseEntity.ok(ApiResponse.success("Your application to become a Seettu Organizer has been submitted successfully.", application));
    }

    @GetMapping("/organizer-status")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getOrganizerStatus(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(authService.getApplicationStatus(query)));
    }

    @PostMapping("/activate-organizer")
    public ResponseEntity<ApiResponse<AuthResponse>> activateOrganizer(@RequestBody java.util.Map<String, String> payload) {
        String query = payload.get("query");
        String password = payload.get("password");
        AuthResponse response = authService.activateOrganizer(query, password);
        return ResponseEntity.ok(ApiResponse.success("Organizer account activated successfully. Welcome to SeettuManager!", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(request)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestParam String email, @RequestParam String newPassword) {
        authService.resetPassword(email, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestParam Long userId,
                                                            @RequestParam String currentPassword,
                                                            @RequestParam String newPassword) {
        authService.changePassword(userId, currentPassword, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
