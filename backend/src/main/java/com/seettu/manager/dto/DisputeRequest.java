package com.seettu.manager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DisputeRequest {
    @NotNull(message = "Group ID is required")
    private Long groupId;

    @NotBlank(message = "Dispute type is required")
    private String type;

    @NotBlank(message = "Description is required")
    private String description;
}
