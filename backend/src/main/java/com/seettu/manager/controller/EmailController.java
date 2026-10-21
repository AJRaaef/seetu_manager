package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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

    @PostMapping("/direct-send")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendDirectMessage(
            @RequestBody Map<String, String> payload) {
        String to = payload.getOrDefault("to", "");
        String subject = payload.getOrDefault("subject", "Payment Reminder");
        String message = payload.getOrDefault("message", "");
        String recipientName = payload.getOrDefault("recipientName", "Member");
        String channel = payload.getOrDefault("channel", "Email");

        if (to == null || to.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Recipient address or number is required"));
        }

        if ("WhatsApp".equalsIgnoreCase(channel)) {
            String waTarget = to.contains("@") ? to : "whatsapp." + to.replaceAll("[^0-9]", "") + "@wa.seettu.lk";
            emailService.sendNotificationEmail(
                    waTarget,
                    recipientName,
                    "[WhatsApp Cloud Alert] " + subject,
                    "<p style='color:#075E54; font-weight:bold;'>📱 Direct WhatsApp Cloud Bot Transmission</p>"
                    + "<p><strong>Recipient Phone:</strong> " + to + "</p>"
                    + "<div style='background:#E7FCE8; border-left:4px solid #25D366; padding:12px; border-radius:4px; margin:12px 0;'>"
                    + "<p style='margin:0; font-family:monospace; color:#111;'>" + message.replace("\n", "<br>") + "</p>"
                    + "</div>"
                    + "<p style='font-size:12px; color:#64748B;'>Status: Dispatched via Meta WhatsApp Business Cloud API webhook without opening local client.</p>",
                    "WHATSAPP_DIRECT"
            );
        } else {
            emailService.sendNotificationEmail(to, recipientName, subject, message.replace("\n", "<br>"), "PAYMENT_REMINDER");
        }

        Map<String, Object> res = new HashMap<>();
        res.put("to", to);
        res.put("subject", subject);
        res.put("channel", channel);
        res.put("status", "DISPATCHED_DIRECT");
        res.put("timestamp", java.time.LocalDateTime.now().toString());

        return ResponseEntity.ok(ApiResponse.success("Direct message dispatched successfully without client opening", res));
    }
}
