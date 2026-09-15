package com.seettu.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreResponse {
    private Long userId;
    private String fullName;
    private double score;
    private String category;
    private long totalPayments;
    private long latePayments;
    private long missedPayments;
    private double avgDelayDays;
}
