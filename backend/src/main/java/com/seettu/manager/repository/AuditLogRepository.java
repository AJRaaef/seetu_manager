package com.seettu.manager.repository;

import com.seettu.manager.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);
    List<AuditLog> findByTargetTableAndTargetIdOrderByTimestampDesc(String targetTable, Long targetId);
    List<AuditLog> findByActionOrderByTimestampDesc(String action);
    List<AuditLog> findByTargetTableOrderByTimestampDesc(String targetTable);
    
    @Query("SELECT a FROM AuditLog a WHERE a.targetTable IN ('payments', 'advance_payments') ORDER BY a.timestamp DESC")
    List<AuditLog> findPaymentAuditLogs();

    @Query("SELECT a FROM AuditLog a ORDER BY a.timestamp DESC")
    List<AuditLog> findAllOrderByTimestampDesc();
}
