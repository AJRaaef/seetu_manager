package com.seettu.manager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationRequest {

    @NotBlank(message = "NIC number is required")
    @Pattern(regexp = "^([0-9]{9}[vVxX]|[0-9]{12})$", message = "Invalid Sri Lankan NIC number. Must be 9 digits followed by V/X or modern 12 digits")
    private String nicNumber;

    private String gnDivision;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate gnIssueDate;

    // Optional initial additional document
    private String additionalDocType;
    private String additionalDocName;
    private String additionalDocDescription;
}
