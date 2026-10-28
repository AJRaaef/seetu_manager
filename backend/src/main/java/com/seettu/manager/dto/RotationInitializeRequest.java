package com.seettu.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RotationInitializeRequest {
    /**
     * Optional limit for Monthly groups specifying how many slots/members rotate this month.
     * E.g. 3 slots means slots up to 3 are allocated.
     */
    private Integer maxPayoutSlots;
}
