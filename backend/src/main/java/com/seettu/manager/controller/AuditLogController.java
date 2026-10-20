package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.dto.AuditLogResponse;
import com.seettu.manager.entity.AuditLog;
import com.seettu.manager.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAllAuditLogs() {
        List<AuditLog> logs = auditLogService.getAllLogs();
        return ResponseEntity.ok(ApiResponse.success(auditLogService.toResponseList(logs)));
    }

    @GetMapping("/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getPaymentAuditLogs() {
        List<AuditLog> logs = auditLogService.getPaymentAuditLogs();
        return ResponseEntity.ok(ApiResponse.success(auditLogService.toResponseList(logs)));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogsByUser(@PathVariable Long userId) {
        List<AuditLog> logs = auditLogService.getLogsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(auditLogService.toResponseList(logs)));
    }
}
