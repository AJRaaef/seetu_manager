package com.seettu.manager.service;

import com.seettu.manager.dto.PaymentRecordRequest;
import com.seettu.manager.dto.PaymentResponse;
import com.seettu.manager.dto.PendingDueResponse;
import com.seettu.manager.entity.*;
import com.seettu.manager.exception.DuplicateResourceException;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentCycleService paymentCycleService;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final com.seettu.manager.repository.GroupMemberRepository groupMemberRepository;
    private final com.seettu.manager.repository.PaymentEvidenceRepository paymentEvidenceRepository;
    private final com.seettu.manager.repository.PaymentCycleRepository cycleRepository;
    private final com.seettu.manager.repository.SeettuGroupRepository groupRepository;

    @Transactional
    public Payment recordPayment(PaymentRecordRequest request, User recorder) {
        if (request.getCycleId() == null) {
            throw new IllegalArgumentException("Cycle ID is required");
        }
        if (request.getMemberId() == null) {
            throw new IllegalArgumentException("Member ID is required");
        }
        PaymentCycle cycle = paymentCycleService.getCycleById(request.getCycleId());
        User member = userService.getUserById(request.getMemberId());

        // Validate that circle is not still forming
        if (cycle.getGroup() != null) {
            int targetMembers = (cycle.getGroup().getMemberCount() != null && cycle.getGroup().getMemberCount() > 0)
                    ? cycle.getGroup().getMemberCount() : 1;
            long currentMembers = groupMemberRepository.countByGroupIdAndStatus(cycle.getGroup().getId(), GroupMember.MemberStatus.ACTIVE);
            if (currentMembers < targetMembers && cycle.getStatus() == PaymentCycle.CycleStatus.PENDING) {
                throw new IllegalStateException("Circle Forming: This Seettu group currently has " + currentMembers + " of " 
                        + targetMembers + " members. Rotational cycles and contributions will open once all members have joined.");
            }
        }

        // Prevent duplicate payments
        if (paymentRepository.existsByCycleIdAndMemberId(request.getCycleId(), request.getMemberId())) {
            Payment existing = paymentRepository.findByCycleIdAndMemberId(request.getCycleId(), request.getMemberId())
                    .orElseThrow();
            if (existing.getStatus() == Payment.PaymentStatus.PAID && (request.getStatus() == null || "PAID".equalsIgnoreCase(request.getStatus()))) {
                throw new DuplicateResourceException("Payment already recorded for this cycle and member");
            }
            LocalDate paymentDate = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now();
            Payment.PaymentStatus updatedStatus = parseStatus(request.getStatus(), Payment.PaymentStatus.PAID);
            if (recorder != null && recorder.getRole() == User.Role.MEMBER) {
                updatedStatus = Payment.PaymentStatus.PENDING;
            } else if (isSettledStatus(updatedStatus)) {
                updatedStatus = getPaidStatus(existing.getCycle(), paymentDate);
            }
            // Update existing pending payment
            existing.setAmount(request.getAmount());
            existing.setStatus(updatedStatus);
            existing.setPaymentDate(paymentDate);
            existing.setRecordedBy(recorder != null && recorder.getRole() == User.Role.MEMBER ? null : recorder);
            existing.setNotes(request.getNotes());
            if (request.getPaymentMethod() != null) {
                existing.setPaymentMethod(request.getPaymentMethod());
            }
            paymentRepository.save(existing);

            auditLogService.log(recorder, "PAYMENT_UPDATED", "payments", existing.getId(),
                    "Payment updated for member: " + member.getFullName() + " in cycle: " + cycle.getCycleNumber());
            notificationService.sendNotification(member.getId(),
                    "Your payment of " + request.getAmount() + " has been recorded for cycle " + cycle.getCycleNumber(), "PAYMENT");

            return existing;
        }

        LocalDate paymentDate = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now();
        Payment.PaymentStatus status = parseStatus(request.getStatus(), null);
        if (recorder != null && recorder.getRole() == User.Role.MEMBER) {
            // Members submitting contributions are always PENDING until Organizer/Admin approves
            status = Payment.PaymentStatus.PENDING;
        } else if (status == Payment.PaymentStatus.PARTIAL
                || (status == null && cycle.getGroup() != null && cycle.getGroup().getContributionAmount() != null
                && request.getAmount().compareTo(cycle.getGroup().getContributionAmount()) < 0)) {
            status = Payment.PaymentStatus.PARTIAL;
        } else {
            status = getPaidStatus(cycle, paymentDate);
        }

        Payment payment = Payment.builder()
                .cycle(cycle)
                .member(member)
                .amount(request.getAmount())
                .status(status)
                .paymentDate(paymentDate)
                .recordedBy(recorder)
                .notes(request.getNotes())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Cash (Offline)")
                .build();

        payment = paymentRepository.save(payment);

        if (payment.getStatus() == Payment.PaymentStatus.PAID || payment.getStatus() == Payment.PaymentStatus.LATE) {
            checkAndUpdateCycleProgress(cycle);
        }

        auditLogService.log(recorder, "PAYMENT_RECORDED", "payments", payment.getId(),
                "Payment recorded for member: " + member.getFullName() + " in cycle: " + cycle.getCycleNumber());
        notificationService.sendNotification(member.getId(),
                "Your payment of " + request.getAmount() + " has been recorded for cycle " + cycle.getCycleNumber(), "PAYMENT");

        return payment;
    }

    @Transactional
    public List<Payment> getPaymentsByGroup(Long groupId) {
        markOverduePayments();
        return paymentRepository.findByGroupIdWithDetails(groupId);
    }

    @Transactional
    public List<Payment> getPaymentsByMember(Long memberId) {
        markOverduePayments();
        List<Payment> list = paymentRepository.findByMemberIdWithDetails(memberId);
        for (Payment payment : list) {
            if (payment.getStatus() == Payment.PaymentStatus.OVERDUE) {
                if (!paymentEvidenceRepository.findByPaymentId(payment.getId()).isEmpty()) {
                    payment.setStatus(Payment.PaymentStatus.PENDING);
                    paymentRepository.save(payment);
                }
            }
        }
        return list;
    }

    @Transactional
    public List<Payment> getPaymentsByCycle(Long cycleId) {
        markOverduePayments();
        return paymentRepository.findByCycleIdWithDetails(cycleId);
    }

    @Transactional
    public List<Payment> getPaymentsByGroupAndMember(Long groupId, Long memberId) {
        markOverduePayments();
        return paymentRepository.findByGroupIdAndMemberId(groupId, memberId);
    }

    @Transactional
    public List<Payment> getAllPayments() {
        markOverduePayments();
        List<Payment> list = paymentRepository.findAllWithDetails().stream()
                .filter(payment -> payment.getMember() != null && payment.getMember().getRole() != User.Role.ADMIN)
                .collect(Collectors.toList());
        for (Payment payment : list) {
            if (payment.getStatus() == Payment.PaymentStatus.OVERDUE) {
                if (!paymentEvidenceRepository.findByPaymentId(payment.getId()).isEmpty()) {
                    payment.setStatus(Payment.PaymentStatus.PENDING);
                    paymentRepository.save(payment);
                }
            }
        }
        return list;
    }

    @Transactional
    public Payment updatePayment(Long id, PaymentRecordRequest request, User recorder) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        if (request.getAmount() != null) {
            payment.setAmount(request.getAmount());
        }
        if (request.getNotes() != null) {
            payment.setNotes(request.getNotes());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            try {
                payment.setStatus(Payment.PaymentStatus.valueOf(request.getStatus().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // invalid status ignored
            }
        }
        if (request.getPaymentDate() != null) {
            payment.setPaymentDate(request.getPaymentDate());
        }
        if (isSettledStatus(payment.getStatus())
                && (request.getPaymentDate() != null || (request.getStatus() != null && !request.getStatus().trim().isEmpty()))) {
            if (request.getPaymentDate() == null && payment.getPaymentDate() == null) {
                payment.setPaymentDate(LocalDate.now());
            }
            payment.setStatus(getPaidStatus(payment.getCycle(), payment.getPaymentDate()));
        }
        if (request.getPaymentMethod() != null && !request.getPaymentMethod().trim().isEmpty()) {
            payment.setPaymentMethod(request.getPaymentMethod());
        }
        if (recorder != null) {
            payment.setRecordedBy(recorder);
        }
        Payment updated = paymentRepository.save(payment);

        if (updated.getStatus() == Payment.PaymentStatus.PAID || updated.getStatus() == Payment.PaymentStatus.LATE) {
            checkAndUpdateCycleProgress(updated.getCycle());
        }

        User logUser = (recorder != null) ? recorder : payment.getRecordedBy();
        auditLogService.log(logUser, "PAYMENT_UPDATED", "payments", payment.getId(),
                "Payment #" + payment.getId() + " updated: amount=" + payment.getAmount() + " LKR, status=" + payment.getStatus());

        return updated;
    }

    @Transactional
    public Payment updatePayment(Long id, PaymentRecordRequest request) {
        return updatePayment(id, request, null);
    }

    @Transactional
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));

        // Delete associated evidences first to prevent foreign key constraints
        List<com.seettu.manager.entity.PaymentEvidence> evidences = paymentEvidenceRepository.findByPaymentId(id);
        if (evidences != null && !evidences.isEmpty()) {
            paymentEvidenceRepository.deleteAll(evidences);
        }

        try {
            auditLogService.log(
                    payment.getRecordedBy() != null ? payment.getRecordedBy() : payment.getMember(),
                    "PAYMENT_DELETED",
                    "payments",
                    payment.getId(),
                    "Payment #" + payment.getId() + " deleted for member: " + (payment.getMember() != null ? payment.getMember().getFullName() : "Member")
            );
        } catch (Exception ignored) {}

        paymentRepository.delete(payment);
    }

        public int getGracePeriodDays(SeettuGroup.CycleFrequency frequency) {
        if (frequency == null) return 5;
        switch (frequency) {
            case DAILY:
                return 1;
            case WEEKLY:
                return 2;
            case BI_WEEKLY:
                return 3;
            case MONTHLY:
            default:
                return 5;
        }
    }

    @Transactional
    public void markOverduePayments() {
        LocalDate today = LocalDate.now();

        // Remove auto-detected records only when the circle is not full or the due date has not passed.
        List<Payment> allOverdue = paymentRepository.findByStatus(Payment.PaymentStatus.OVERDUE);
        for (Payment p : allOverdue) {
            if (p.getNotes() != null && p.getNotes().contains("System Auto-Detected") && p.getCycle() != null) {
                PaymentCycle cycle = p.getCycle();
                SeettuGroup grp = cycle.getGroup();
                if (grp != null) {
                    int targetMembers = (grp.getMemberCount() != null && grp.getMemberCount() > 0) ? grp.getMemberCount() : 1;
                    long activeCount = groupMemberRepository.countByGroupIdAndStatus(grp.getId(), GroupMember.MemberStatus.ACTIVE);
                    if (activeCount < targetMembers || cycle.getEndDate() == null || !today.isAfter(cycle.getEndDate())) {
                        paymentRepository.delete(p);
                    }
                }
            }
        }

        // Mark unpaid payments overdue the day after the due date for fully formed groups.
        List<PaymentCycle> activeCycles = paymentCycleService.getActiveCycles();
        for (PaymentCycle cycle : activeCycles) {
            if (cycle.getGroup() == null) continue;
            SeettuGroup group = cycle.getGroup();

            int targetMemberCount = (group.getMemberCount() != null && group.getMemberCount() > 0) ? group.getMemberCount() : 1;
            List<GroupMember> activeMembers = groupMemberRepository.findByGroupIdAndStatus(
                    group.getId(), GroupMember.MemberStatus.ACTIVE);

            // Never mark overdue if the circle has not reached full capacity yet
            if (activeMembers.size() < targetMemberCount) {
                continue;
            }

            LocalDate dueDate = cycle.getEndDate();
            if (dueDate != null && today.isAfter(dueDate)) {
                java.math.BigDecimal contributionAmount = group.getContributionAmount() != null
                        ? group.getContributionAmount()
                        : java.math.BigDecimal.ZERO;

                for (GroupMember gm : activeMembers) {
                    if (gm.getUser() != null && gm.getUser().getRole() != User.Role.ADMIN) {
                        Long memberUserId = gm.getUser().getId();
                        Optional<Payment> existingPayment = paymentRepository.findByCycleIdAndMemberId(cycle.getId(), memberUserId);
                        if (existingPayment.isEmpty()) {
                            Payment overduePayment = Payment.builder()
                                    .cycle(cycle)
                                    .member(gm.getUser())
                                    .amount(contributionAmount)
                                    .status(Payment.PaymentStatus.OVERDUE)
                                    .paymentMethod("Pending Settlement")
                                    .notes("System Auto-Detected: Contribution unpaid after due date " + dueDate)
                                    .recordedBy(null)
                                    .build();
                            paymentRepository.save(overduePayment);
                            notificationService.sendNotification(memberUserId,
                                    "Your installment for '" + group.getName() + "' (Cycle #" + cycle.getCycleNumber() + ") is overdue.",
                                    "PAYMENT_OVERDUE");
                        } else {
                            Payment p = existingPayment.get();
                            boolean hasSlips = !paymentEvidenceRepository.findByPaymentId(p.getId()).isEmpty();
                            if (hasSlips && p.getStatus() == Payment.PaymentStatus.OVERDUE) {
                                p.setStatus(Payment.PaymentStatus.PENDING);
                                paymentRepository.save(p);
                            }
                        }
                    }
                }
            }
        }
    }

    @Transactional
    public int sendPaymentReminders() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysLater = today.plusDays(7);
        List<PaymentCycle> activeCycles = paymentCycleService.getActiveCycles();
        int remindersSent = 0;

        for (PaymentCycle cycle : activeCycles) {
            LocalDate dueDate = cycle.getEndDate();
            if (dueDate != null && !dueDate.isBefore(today) && !dueDate.isAfter(sevenDaysLater)) {
                String groupName = (cycle.getGroup() != null && cycle.getGroup().getName() != null)
                        ? cycle.getGroup().getName()
                        : "Seettu Group";

                // Notify active members of this group who haven't fully settled payment for this cycle
                if (cycle.getGroup() != null && cycle.getGroup().getId() != null) {
                    List<GroupMember> activeMembers = groupMemberRepository.findByGroupIdAndStatus(
                            cycle.getGroup().getId(), GroupMember.MemberStatus.ACTIVE);
                    java.math.BigDecimal contributionAmount = cycle.getGroup().getContributionAmount() != null
                            ? cycle.getGroup().getContributionAmount()
                            : java.math.BigDecimal.ZERO;

                    for (GroupMember gm : activeMembers) {
                        if (gm.getUser() != null) {
                            Long memberUserId = gm.getUser().getId();
                            Optional<Payment> existingPayment = paymentRepository.findByCycleIdAndMemberId(cycle.getId(), memberUserId);
                            boolean isSettled = existingPayment.isPresent() && existingPayment.get().getStatus() == Payment.PaymentStatus.PAID;

                            if (!isSettled) {
                                String msg = String.format("Payment Reminder: Your installment of LKR %.2f for '%s' (Cycle #%d) is due on %s. Please ensure your payment is settled on time.",
                                        contributionAmount, groupName, cycle.getCycleNumber(), dueDate.toString());
                                notificationService.sendNotification(memberUserId, msg, "PAYMENT_REMINDER");
                                remindersSent++;
                            }
                        }
                    }
                }
            }
        }
        return remindersSent;
    }


    private void checkAndUpdateCycleProgress(PaymentCycle cycle) {
        if (cycle == null || cycle.getGroup() == null) return;
        SeettuGroup group = cycle.getGroup();

        int targetMemberCount = (group.getMemberCount() != null && group.getMemberCount() > 0) ? group.getMemberCount() : 1;
        List<GroupMember> activeMembers = groupMemberRepository.findByGroupIdAndStatus(group.getId(), GroupMember.MemberStatus.ACTIVE);
        
        // Cycle CANNOT complete unless the group is full
        if (activeMembers.size() < targetMemberCount) return;

        List<Payment> cyclePayments = paymentRepository.findByCycleId(cycle.getId());
        long paidMembers = cyclePayments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.PAID || p.getStatus() == Payment.PaymentStatus.LATE)
                .map(p -> p.getMember() != null ? p.getMember().getId() : null)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count();

        // Cycle completes ONLY when all required members have paid
        if (paidMembers >= targetMemberCount) {
            if (cycle.getStatus() != PaymentCycle.CycleStatus.COMPLETED) {
                paymentCycleService.updateCycleStatus(cycle.getId(), "COMPLETED");
            }
        }
    }


    @Transactional(readOnly = true)
    public List<PendingDueResponse> getPendingDuesForMember(Long memberId) {
        LocalDate today = LocalDate.now();
        List<SeettuGroup> userGroups = groupRepository.findGroupsByMemberId(memberId);
        List<PendingDueResponse> dues = new java.util.ArrayList<>();

        for (SeettuGroup group : userGroups) {
            if (group.getStatus() != SeettuGroup.GroupStatus.ACTIVE) {
                continue;
            }

            List<PaymentCycle> cycles = cycleRepository.findByGroupIdOrderByCycleNumberAsc(group.getId());
            int totalCycles = cycles.isEmpty() ? (group.getMemberCount() != null ? group.getMemberCount() : 1) : cycles.size();

            PaymentCycle currentCycle = cycles.stream()
                    .filter(c -> c.getStatus() == PaymentCycle.CycleStatus.ACTIVE)
                    .findFirst()
                    .orElse(null);

            if (currentCycle == null) {
                currentCycle = cycles.stream()
                        .filter(c -> c.getStatus() != PaymentCycle.CycleStatus.COMPLETED)
                        .findFirst()
                        .orElse(null);
            }

            if (currentCycle == null) {
                continue;
            }

            Optional<Payment> paymentOpt = paymentRepository.findByCycleIdAndMemberId(currentCycle.getId(), memberId);
            boolean isFullySettled = paymentOpt.isPresent() &&
                    (paymentOpt.get().getStatus() == Payment.PaymentStatus.PAID || paymentOpt.get().getStatus() == Payment.PaymentStatus.LATE);

            if (isFullySettled) {
                continue;
            }

            java.math.BigDecimal contributionAmount = group.getContributionAmount() != null
                    ? group.getContributionAmount()
                    : java.math.BigDecimal.ZERO;

            LocalDate dueDate = currentCycle.getEndDate() != null
                    ? currentCycle.getEndDate()
                    : (currentCycle.getStartDate() != null ? currentCycle.getStartDate().plusDays(30) : today);

            long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(today, dueDate);
            boolean isOverdue = today.isAfter(dueDate);
            boolean inGracePeriod = false;
            long daysOverdue = isOverdue ? ChronoUnit.DAYS.between(dueDate, today) : 0;
            int graceDaysRemaining = 0;

            String status;
            Long existingPaymentId = null;
            boolean hasSlipUploaded = false;

            if (paymentOpt.isPresent()) {
                Payment p = paymentOpt.get();
                existingPaymentId = p.getId();
                hasSlipUploaded = !paymentEvidenceRepository.findByPaymentId(p.getId()).isEmpty();

                if (hasSlipUploaded || p.getStatus() == Payment.PaymentStatus.PENDING) {
                    status = "AWAITING_APPROVAL";
                } else if (p.getStatus() == Payment.PaymentStatus.OVERDUE || isOverdue) {
                    status = "OVERDUE";
                } else if (inGracePeriod) {
                    status = "IN_GRACE_PERIOD";
                } else if (daysRemaining == 0) {
                    status = "DUE_TODAY";
                } else if (daysRemaining <= 7) {
                    status = "DUE_SOON";
                } else {
                    status = "UPCOMING";
                }
            } else {
                if (isOverdue) {
                    status = "OVERDUE";
                } else if (inGracePeriod) {
                    status = "IN_GRACE_PERIOD";
                } else if (daysRemaining == 0) {
                    status = "DUE_TODAY";
                } else if (daysRemaining <= 7) {
                    status = "DUE_SOON";
                } else {
                    status = "UPCOMING";
                }
            }

            String organizerName = group.getCreatedBy() != null ? group.getCreatedBy().getFullName() : "Organizer";

            dues.add(PendingDueResponse.builder()
                    .groupId(group.getId())
                    .groupName(group.getName())
                    .cycleId(currentCycle.getId())
                    .cycleNumber(currentCycle.getCycleNumber())
                    .totalCycles(totalCycles)
                    .amount(contributionAmount)
                    .dueDate(dueDate)
                    .daysRemaining(daysRemaining)
                    .isOverdue(isOverdue)
                    .daysOverdue(daysOverdue)
                    .inGracePeriod(inGracePeriod)
                    .graceDaysRemaining(graceDaysRemaining)
                    .status(status)
                    .existingPaymentId(existingPaymentId)
                    .hasSlipUploaded(hasSlipUploaded)
                    .organizerName(organizerName)
                    .build());
        }

        return dues;
    }

    public PaymentResponse toPaymentResponse(Payment payment) {
        List<String> evidenceUrls = paymentEvidenceRepository.findByPaymentId(payment.getId())
                .stream()
                .map(com.seettu.manager.entity.PaymentEvidence::getFilePath)
                .collect(Collectors.toList());

        return PaymentResponse.builder()
                .id(payment.getId())
                .cycleId(payment.getCycle().getId())
                .cycleNumber(payment.getCycle().getCycleNumber())
                .memberId(payment.getMember().getId())
                .memberName(payment.getMember().getFullName())
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .paymentDate(getPaymentDateForTiming(payment))
                .cycleStartDate(payment.getCycle().getStartDate())
                .dueDate(payment.getCycle().getEndDate())
                .daysEarly(calculateDaysEarly(payment))
                .daysLate(calculateDaysLate(payment))
                .daysOverdue(calculateDaysOverdue(payment))
                .recordedByName(payment.getRecordedBy() != null ? payment.getRecordedBy().getFullName() : (payment.getStatus() == Payment.PaymentStatus.PENDING ? "Awaiting Organizer Approval" : "System Auto-Detected"))
                .notes(payment.getNotes())
                .paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod() : "Cash (Offline)")
                .createdAt(payment.getCreatedAt())
                .groupName(payment.getCycle().getGroup().getName())
                .memberPhone(payment.getMember() != null ? payment.getMember().getPhone() : null)
                .memberEmail(payment.getMember() != null ? payment.getMember().getEmail() : null)
                .evidenceUrls(evidenceUrls)
                .expectedAmount(payment.getCycle() != null && payment.getCycle().getGroup() != null ? payment.getCycle().getGroup().getContributionAmount() : null)
                .build();
    }

    private Payment.PaymentStatus parseStatus(String requestedStatus, Payment.PaymentStatus fallback) {
        if (requestedStatus == null || requestedStatus.trim().isEmpty()) {
            return fallback;
        }
        try {
            return Payment.PaymentStatus.valueOf(requestedStatus.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return fallback;
        }
    }

    private boolean isSettledStatus(Payment.PaymentStatus status) {
        return status == Payment.PaymentStatus.PAID || status == Payment.PaymentStatus.LATE;
    }

    private LocalDate getPaymentDateForTiming(Payment payment) {
        if (payment.getPaymentDate() != null) {
            return payment.getPaymentDate();
        }
        return isSettledStatus(payment.getStatus()) && payment.getCreatedAt() != null
                ? payment.getCreatedAt().toLocalDate()
                : null;
    }

    private Payment.PaymentStatus getPaidStatus(PaymentCycle cycle, LocalDate paymentDate) {
        return cycle != null && cycle.getEndDate() != null && paymentDate != null
                && paymentDate.isAfter(cycle.getEndDate())
                ? Payment.PaymentStatus.LATE
                : Payment.PaymentStatus.PAID;
    }

    private Long calculateDaysEarly(Payment payment) {
        LocalDate dueDate = payment.getCycle().getEndDate();
        LocalDate paymentDate = getPaymentDateForTiming(payment);
        if (payment.getStatus() != Payment.PaymentStatus.PAID || dueDate == null || paymentDate == null || !paymentDate.isBefore(dueDate)) {
            return 0L;
        }
        return ChronoUnit.DAYS.between(paymentDate, dueDate);
    }

    private Long calculateDaysLate(Payment payment) {
        LocalDate dueDate = payment.getCycle().getEndDate();
        LocalDate paymentDate = getPaymentDateForTiming(payment);
        if (dueDate == null || paymentDate == null) {
            return payment.getStatus() == Payment.PaymentStatus.LATE ? 1L : 0L;
        }
        if (paymentDate.isAfter(dueDate)) {
            return ChronoUnit.DAYS.between(dueDate, paymentDate);
        }
        return payment.getStatus() == Payment.PaymentStatus.LATE ? 1L : 0L;
    }

    private Long calculateDaysOverdue(Payment payment) {
        LocalDate dueDate = payment.getCycle().getEndDate();
        if ((payment.getStatus() != Payment.PaymentStatus.OVERDUE
                && payment.getStatus() != Payment.PaymentStatus.MISSED
                && payment.getStatus() != Payment.PaymentStatus.PARTIAL)
                || dueDate == null || !LocalDate.now().isAfter(dueDate)) {
            return 0L;
        }
        return ChronoUnit.DAYS.between(dueDate, LocalDate.now());
    }

    public List<PaymentResponse> toPaymentResponseList(List<Payment> payments) {
        return payments.stream().map(this::toPaymentResponse).collect(Collectors.toList());
    }
}
