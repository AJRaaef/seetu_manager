package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.entity.Certificate;
import com.seettu.manager.entity.SeettuGroup;
import com.seettu.manager.entity.User;
import com.seettu.manager.service.CertificateService;
import com.seettu.manager.service.SeettuGroupService;
import com.seettu.manager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;
    private final UserService userService;
    private final SeettuGroupService groupService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<Certificate>> generateCertificate(@RequestParam Long userId,
                                                                        @RequestParam Long groupId) {
        try {
            User user = userService.getUserById(userId);
            SeettuGroup group = groupService.getGroupById(groupId);
            Certificate certificate = certificateService.generateCertificate(user, group);
            return ResponseEntity.ok(ApiResponse.success("Certificate generated successfully", certificate));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to generate certificate: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<List<Certificate>>> getAllCertificates() {
        return ResponseEntity.ok(ApiResponse.success(certificateService.getAllCertificates()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Certificate>>> getCertificatesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(certificateService.getCertificatesByUser(userId)));
    }
}
