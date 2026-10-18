package com.seettu.manager.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
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
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Double overallCompletionRate;
    private Map<String, Long> paymentStatusDistribution;
    private Map<String, Long> groupStatusDistribution;
    private List<MonthlyCashflowDTO> monthlyCashflow;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyCashflowDTO {
        private String month;
        private double inflow;
        private double outflow;
    }
}
