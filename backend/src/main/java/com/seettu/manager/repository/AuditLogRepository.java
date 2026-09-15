package com.seettu.manager.repository;

import com.seettu.manager.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserId(Long userId);
    List<AuditLog> findByTargetTableAndTargetId(String targetTable, Long targetId);
    List<AuditLog> findByAction(String action);
}
