package com.seettu.manager.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class EmergencyRequestDto {
    @NotNull(message = "Group ID is required")
    private Long groupId;

    @NotNull(message = "Requested amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal requestedAmount;

    @NotBlank(message = "Reason is required")
    private String reason;
}
