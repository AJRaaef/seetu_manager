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
public class OrganizerApplicationResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String district;
    private String plannedSeettuModel;
    private Integer targetMemberCount;
    private Double plannedContributionAmount;
    private String experienceLevel;
    private String proposalNotes;
    private String organizerApplicationNote;
    private String nicNumber;
    private String gnCertificateUrl;
    private String nicFrontImagePath;
    private String nicBackImagePath;
    private String gnCertificateImagePath;
    private String kycStatus;
    private LocalDateTime appliedAt;
}
