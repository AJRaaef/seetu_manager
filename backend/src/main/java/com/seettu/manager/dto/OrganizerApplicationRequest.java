package com.seettu.manager.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizerApplicationRequest {

    // --- Required Fields per Specification ---
    @NotBlank(message = "Operating district is required")
    private String operatingDistrict;

    // Planned Seettu model (optional / removed from application form)
    private String plannedSeettuModel;

    @NotNull(message = "Target member count is required")
    @Min(value = 2, message = "Target member count must be at least 2")
    private Integer targetMemberCount;

    @NotNull(message = "Planned contribution amount is required")
    @Min(value = 100, message = "Planned contribution amount must be at least 100 LKR")
    private Double plannedContributionAmount;

    @NotBlank(message = "Experience level is required")
    private String experienceLevel;

    private String proposalNotes;

    @NotNull(message = "Terms agreement must be accepted")
    @AssertTrue(message = "You must agree to the Organizer Terms & Conditions")
    private Boolean agreementAccepted;

    // --- Optional / Legacy Backward Compatibility Fields ---
    private String fullName;
    private String email;
    private String phone;
    private String addressLine1;
    private String addressLine2;
    private String postalCode;
    private String district;
    private String message;

    public String getDistrict() {
        if (district != null && !district.trim().isEmpty()) {
            return district;
        }
        return operatingDistrict;
    }

    public String getMessage() {
        if (message != null && !message.trim().isEmpty()) {
            return message;
        }
        return proposalNotes;
    }
}
