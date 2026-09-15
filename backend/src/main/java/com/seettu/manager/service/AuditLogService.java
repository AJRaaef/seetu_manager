package com.seettu.manager.service;

import com.seettu.manager.entity.AuditLog;
import com.seettu.manager.entity.User;
import com.seettu.manager.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

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

    public List<AuditLog> getLogsByUser(Long userId) {
        return auditLogRepository.findByUserId(userId);
    }

    public List<AuditLog> getLogsByTarget(String targetTable, Long targetId) {
        return auditLogRepository.findByTargetTableAndTargetId(targetTable, targetId);
    }

    public List<AuditLog> getLogsByAction(String action) {
        return auditLogRepository.findByAction(action);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAll();
    }
}
