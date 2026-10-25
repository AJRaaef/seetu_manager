package com.seettu.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "seettu_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SeettuGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "contribution_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal contributionAmount;

    @Column(name = "member_count", nullable = false)
    private Integer memberCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "cycle_frequency", nullable = false)
    private CycleFrequency cycleFrequency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seettu_type_id")
    private SeettuType seettuType;

    @Column(length = 50)
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    private Shop shop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = GroupStatus.PENDING;
        if (cycleFrequency == null) cycleFrequency = CycleFrequency.MONTHLY;
    }

    public enum CycleFrequency {
        DAILY, WEEKLY, BI_WEEKLY, MONTHLY
    }

    public enum GroupStatus {
        ACTIVE, COMPLETED, CANCELLED, PENDING
    }
}
