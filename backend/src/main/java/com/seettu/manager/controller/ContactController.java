package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final EmailService emailService;

    @Value("${admin.contact-email:admin@seetumanager.com}")
    private String adminEmail;

    @Data
    public static class ContactRequest {
        private String name;
        private String email;
        private String phone;
        private String subject;
        private String message;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submitContactInquiry(@RequestBody ContactRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email address is required."));
        }
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Message body cannot be empty."));
        }

        String senderName = request.getName() != null && !request.getName().trim().isEmpty() ? request.getName() : "Public Visitor";
        String subject = request.getSubject() != null && !request.getSubject().trim().isEmpty() ? request.getSubject() : "Platform Inquiry";

        emailService.sendContactInquiryEmail(
                adminEmail,
                senderName,
                request.getEmail().trim(),
                request.getPhone(),
                subject,
                request.getMessage().trim()
        );

        return ResponseEntity.ok(ApiResponse.success("Your inquiry has been submitted successfully. Our support desk will respond shortly.", null));
    }
}
