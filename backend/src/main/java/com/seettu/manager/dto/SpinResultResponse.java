package com.seettu.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpinResultResponse {
    private Long userId;
    private String fullName;
    private Integer assignedNumber;
    private String spinResult;
    private LocalDateTime spunAt;
    private boolean isNo;
    private String message;
    private List<Integer> availableNumbers;
    private int remainingSpins;
    private boolean isRotationCompleted;
}
