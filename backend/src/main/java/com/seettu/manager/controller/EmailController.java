package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @GetMapping("/outbox")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getOutboxMessages() {
        return ResponseEntity.ok(ApiResponse.success("Outbox loaded successfully", emailService.getOutboxMessages()));
    }

    @GetMapping(value = "/outbox/{fileName}/preview", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> previewEmailHtml(@PathVariable String fileName) {
        String html = emailService.getEmailHtml(fileName);
        if (html == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(html);
    }

    @PostMapping("/test-send")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendDemoEmail(
            @RequestParam(defaultValue = "member@example.com") String to,
            @RequestParam(defaultValue = "PAYMENT_REMINDER") String type) {
        Map<String, Object> result = emailService.sendDemoEmail(to, type);
        return ResponseEntity.ok(ApiResponse.success("Demo email dispatched successfully to outbox", result));
    }
}
