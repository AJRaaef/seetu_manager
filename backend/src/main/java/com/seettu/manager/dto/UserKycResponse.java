package com.seettu.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserKycResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String nicNumber;
    private String gnCertificateUrl;
    private String profilePictureUrl;
    private String kycStatus;
    private String kycRejectionReason;
    private String requestedRole;
    private String district;
    private String address;
    private String organizerApplicationNote;
    private Long verifiedById;
    private String verifiedByName;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;
}
