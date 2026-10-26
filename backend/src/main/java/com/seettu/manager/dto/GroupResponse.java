package com.seettu.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal contributionAmount;
    private Integer memberCount;
    private String cycleFrequency;
    private String status;
    private String seettuTypeName;
    private String category;
    private Long shopId;
    private String shopName;
    private String shopAddress;
    private String createdByName;
    private Long createdById;
    private LocalDateTime createdAt;
    private List<MemberInfo> members;
    private List<CycleInfo> cycles;
    private Integer completedCycles;
    private Double completionRate;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberInfo {
        private Long id;
        private Long userId;
        private String fullName;
        private String email;
        private String phone;
        private String nicNumber;
        private String role;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CycleInfo {
        private Long id;
        private Integer cycleNumber;
        private String startDate;
        private String endDate;
        private Long payoutMemberId;
        private String payoutMemberName;
        private String status;
        private Long paidCount;
        private Boolean isFullyPaid;
    }
}
