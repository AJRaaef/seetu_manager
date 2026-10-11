package com.seettu.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private String preferredLanguage;
    private String nicNumber;
    private String kycStatus;
    private String gnCertificateUrl;
    private String kycRejectionReason;

    public Long getId() {
        return userId;
    }
}
