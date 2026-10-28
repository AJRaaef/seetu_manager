package com.seettu.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RotationStatusResponse {
    private Long cycleId;
    private Integer cycleNumber;
    private Long groupId;
    private String groupName;
    private String cycleFrequency;
    private int totalMembersCount;
    private int paidMembersCount;
    private boolean isFullyPaid;
    private String paymentStatusMessage;
    private String rotationStatus; // PENDING, IN_PROGRESS, COMPLETED
    private Integer maxPayoutSlots;
    private Long organizerId;
    private String organizerName;
    private boolean isOrganizer;
    private boolean canInitialize;
    private boolean canSpin;
    private boolean hasSpun;
    private RotationAssignmentDto myResult;
    private boolean isLocked;
    private boolean canStart;
    private List<Integer> allPossibleNumbers;
    private List<Integer> takenNumbers;
    private List<Integer> availableNumbers;
    private int remainingSpins;
    private int totalSpinsCompleted;
    private List<RotationAssignmentDto> assignments;
}
