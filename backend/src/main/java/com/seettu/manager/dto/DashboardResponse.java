package com.seettu.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalGroups;
    private long activeGroups;
    private long totalMembers;
    private long totalPayments;
    private long pendingPayments;
    private long overduePayments;
    private long openDisputes;
    private long pendingEmergencies;
    private long reportsGenerated;
    private long certificatesEarned;
    private int disciplineScore;
    private int nextPaymentDueDays;
    private double overallCompletionRate;
    private Map<String, Long> paymentStatusDistribution;
    private Map<String, Long> groupStatusDistribution;
}
