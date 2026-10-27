package com.seettu.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "member_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MemberVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "nic_number", nullable = false, length = 20)
    private String nicNumber;

    @Column(name = "nic_front_image_path", nullable = false, length = 500)
    private String nicFrontImagePath;

    @Column(name = "nic_back_image_path", nullable = false, length = 500)
    private String nicBackImagePath;

    @Column(name = "gn_certificate_image_path", nullable = false, length = 500)
    private String gnCertificateImagePath;

    @Column(name = "gn_division", length = 100)
    private String gnDivision;

    @Column(name = "gn_issue_date")
    private LocalDate gnIssueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 20)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "verification", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<MemberAdditionalDocument> additionalDocuments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (verificationStatus == null) {
            verificationStatus = VerificationStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addAdditionalDocument(MemberAdditionalDocument doc) {
        if (additionalDocuments == null) {
            additionalDocuments = new ArrayList<>();
        }
        additionalDocuments.add(doc);
        doc.setVerification(this);
    }

    public void removeAdditionalDocument(MemberAdditionalDocument doc) {
        if (additionalDocuments != null) {
            additionalDocuments.remove(doc);
            doc.setVerification(null);
        }
    }
}
