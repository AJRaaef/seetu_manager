package com.seettu.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingDueResponse {
    private Long groupId;
    private String groupName;
    private Long cycleId;
    private Integer cycleNumber;
    private Integer totalCycles;
    private BigDecimal amount;
    private LocalDate dueDate;
    private Long daysRemaining;
    private boolean isOverdue;
    private Long daysOverdue;
    private String status; // "UPCOMING", "DUE_SOON", "DUE_TODAY", "OVERDUE", "AWAITING_APPROVAL"
    private Long existingPaymentId;
    private boolean hasSlipUploaded;
    private String organizerName;
}
