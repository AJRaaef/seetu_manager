package com.seettu.manager.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class GroupCreateRequest {
    @NotBlank(message = "Group name is required")
    @Size(max = 100, message = "Group name must not exceed 100 characters")
    private String name;

    private String description;

    @NotNull(message = "Contribution amount is required")
    @DecimalMin(value = "0.01", message = "Contribution amount must be greater than 0")
    private BigDecimal contributionAmount;

    @NotNull(message = "Member count is required")
    @Min(value = 2, message = "Member count must be at least 2")
    private Integer memberCount;

    @NotBlank(message = "Cycle frequency is required")
    private String cycleFrequency;

    private Long seettuTypeId;
    private String category;
    private Long shopId;
}
