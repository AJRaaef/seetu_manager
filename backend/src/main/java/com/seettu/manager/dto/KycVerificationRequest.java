package com.seettu.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycVerificationRequest {
    private String status; // "VERIFIED" or "REJECTED"
    private String rejectionReason;
    private String role; // optional: "ORGANIZER"
}
