package com.seettu.manager.dto;

import com.seettu.manager.entity.VerificationStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String nicNumber;
    private String nicFrontImagePath;
    private String nicBackImagePath;
    private String gnCertificateImagePath;
    private String gnDivision;
    private LocalDate gnIssueDate;
    private VerificationStatus verificationStatus;
    private Long verifiedById;
    private String verifiedByName;
    private LocalDateTime verifiedAt;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AdditionalDocumentResponse> additionalDocuments;
}
