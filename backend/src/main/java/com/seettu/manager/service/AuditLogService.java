package com.seettu.manager.service;

import com.seettu.manager.dto.AuditLogResponse;
import com.seettu.manager.entity.AuditLog;
import com.seettu.manager.entity.User;
import com.seettu.manager.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(User user, String action, String targetTable, Long targetId, String details) {
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .targetTable(targetTable)
                .targetId(targetId)
                .details(details)
                .build();
        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getLogsByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getLogsByTarget(String targetTable, Long targetId) {
        return auditLogRepository.findByTargetTableAndTargetIdOrderByTimestampDesc(targetTable, targetId);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getLogsByAction(String action) {
        return auditLogRepository.findByActionOrderByTimestampDesc(action);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getPaymentAuditLogs() {
        return auditLogRepository.findPaymentAuditLogs();
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllOrderByTimestampDesc();
    }

    public AuditLogResponse toResponse(AuditLog log) {
        User user = log.getUser();
        return AuditLogResponse.builder()
                .id(log.getId())
                .userId(user != null ? user.getId() : null)
                .userName(user != null ? user.getFullName() : "System / Anonymous")
                .userRole(user != null && user.getRole() != null ? user.getRole().name() : "SYSTEM")
                .action(log.getAction())
                .targetTable(log.getTargetTable())
                .targetId(log.getTargetId())
                .details(log.getDetails())
                .timestamp(log.getTimestamp())
                .build();
    }

    public List<AuditLogResponse> toResponseList(List<AuditLog> logs) {
        return logs.stream().map(this::toResponse).collect(Collectors.toList());
    }
}
