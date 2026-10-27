package com.seettu.manager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationRejectRequest {

    @NotBlank(message = "Rejection reason is required")
    private String reason;
}
