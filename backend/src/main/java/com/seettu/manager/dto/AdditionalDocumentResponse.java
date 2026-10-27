package com.seettu.manager.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdditionalDocumentResponse {
    private Long id;
    private Long verificationId;
    private String documentType;
    private String documentName;
    private String documentImagePath;
    private String description;
    private LocalDateTime uploadedAt;
}
