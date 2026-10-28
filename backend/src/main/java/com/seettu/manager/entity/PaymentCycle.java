package com.seettu.manager.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "payment_cycles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PaymentCycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private SeettuGroup group;

    @Column(name = "cycle_number", nullable = false)
    private Integer cycleNumber;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payout_member_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User payoutMember;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CycleStatus status;

    @Column(name = "max_payout_slots")
    private Integer maxPayoutSlots;

    @Column(name = "rotation_status", length = 50, nullable = false)
    private String rotationStatus;

    @PrePersist
    protected void onCreate() {
        if (status == null) status = CycleStatus.PENDING;
        if (rotationStatus == null) rotationStatus = "PENDING";
    }

    public enum CycleStatus {
        PENDING, ACTIVE, COMPLETED
    }
}
