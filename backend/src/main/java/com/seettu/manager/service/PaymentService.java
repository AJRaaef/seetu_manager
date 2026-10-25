package com.seettu.manager.service;

import com.seettu.manager.dto.PaymentRecordRequest;
import com.seettu.manager.dto.PaymentResponse;
import com.seettu.manager.entity.*;
import com.seettu.manager.exception.DuplicateResourceException;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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

        // Prevent duplicate payments
        if (paymentRepository.existsByCycleIdAndMemberId(request.getCycleId(), request.getMemberId())) {
            Payment existing = paymentRepository.findByCycleIdAndMemberId(request.getCycleId(), request.getMemberId())
                    .orElseThrow();
            if (existing.getStatus() == Payment.PaymentStatus.PAID && (request.getStatus() == null || "PAID".equalsIgnoreCase(request.getStatus()))) {
                throw new DuplicateResourceException("Payment already recorded for this cycle and member");
            }
            // Parse requested status if provided, else default to PAID
            Payment.PaymentStatus updatedStatus = Payment.PaymentStatus.PAID;
            if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
                try {
                    updatedStatus = Payment.PaymentStatus.valueOf(request.getStatus().trim().toUpperCase());
                } catch (IllegalArgumentException e) {
                    updatedStatus = Payment.PaymentStatus.PAID;
                }
            }
            // Update existing pending payment
            existing.setAmount(request.getAmount());
            existing.setStatus(updatedStatus);
            existing.setPaymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now());
            existing.setRecordedBy(recorder);
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

        // Determine status based on explicit request or timing and contribution amount
        Payment.PaymentStatus status = Payment.PaymentStatus.PAID;
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            try {
                status = Payment.PaymentStatus.valueOf(request.getStatus().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                status = Payment.PaymentStatus.PAID;
            }
        } else if (recorder != null && recorder.getRole() == User.Role.MEMBER) {
            status = Payment.PaymentStatus.PENDING;
        } else if (cycle.getGroup() != null && cycle.getGroup().getContributionAmount() != null
                && request.getAmount().compareTo(cycle.getGroup().getContributionAmount()) < 0) {
            status = Payment.PaymentStatus.PARTIAL;
        } else if (LocalDate.now().isAfter(cycle.getEndDate())) {
            status = Payment.PaymentStatus.LATE;
        }

        Payment payment = Payment.builder()
                .cycle(cycle)
                .member(member)
                .amount(request.getAmount())
                .status(status)
                .paymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now())
                .recordedBy(recorder)
                .notes(request.getNotes())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Cash (Offline)")
                .build();

        payment = paymentRepository.save(payment);

        auditLogService.log(recorder, "PAYMENT_RECORDED", "payments", payment.getId(),
                "Payment recorded for member: " + member.getFullName() + " in cycle: " + cycle.getCycleNumber());
        notificationService.sendNotification(member.getId(),
                "Your payment of " + request.getAmount() + " has been recorded for cycle " + cycle.getCycleNumber(), "PAYMENT");

        return payment;
    }

    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByGroup(Long groupId) {
        return paymentRepository.findByGroupIdWithDetails(groupId);
    }

    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByMember(Long memberId) {
        return paymentRepository.findByMemberIdWithDetails(memberId);
    }

    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByCycle(Long cycleId) {
        return paymentRepository.findByCycleIdWithDetails(cycleId);
    }

    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByGroupAndMember(Long groupId, Long memberId) {
        return paymentRepository.findByGroupIdAndMemberId(groupId, memberId);
    }

    @Transactional
    public List<Payment> getAllPayments() {
        markOverduePayments();
        return paymentRepository.findAllWithDetails().stream()
                .filter(payment -> payment.getMember() != null && payment.getMember().getRole() != User.Role.ADMIN)
                .collect(Collectors.toList());
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
        if (request.getPaymentMethod() != null && !request.getPaymentMethod().trim().isEmpty()) {
            payment.setPaymentMethod(request.getPaymentMethod());
        }
        if (recorder != null) {
            payment.setRecordedBy(recorder);
        }
        Payment updated = paymentRepository.save(payment);

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
        auditLogService.log(payment.getRecordedBy(), "PAYMENT_DELETED", "payments", payment.getId(),
                "Payment #" + payment.getId() + " deleted for member: " + (payment.getMember() != null ? payment.getMember().getFullName() : "Member"));
        paymentRepository.delete(payment);
    }

    @Transactional
    public void markOverduePayments() {
        LocalDate today = LocalDate.now();
        List<PaymentCycle> activeCycles = paymentCycleService.getActiveCycles();
        for (PaymentCycle cycle : activeCycles) {
            LocalDate dueDate = cycle.getEndDate();
            if (dueDate != null && !dueDate.isAfter(today) && cycle.getGroup() != null) {
                List<GroupMember> activeMembers = groupMemberRepository.findByGroupIdAndStatus(
                        cycle.getGroup().getId(), GroupMember.MemberStatus.ACTIVE);
                java.math.BigDecimal contributionAmount = cycle.getGroup().getContributionAmount() != null
                        ? cycle.getGroup().getContributionAmount()
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
                                    .paymentDate(dueDate)
                                    .paymentMethod("Pending Settlement")
                                    .notes("🤖 System Auto-Detected: Contribution not received by due date (" + dueDate + ")")
                                    .recordedBy(null)
                                    .build();
                            paymentRepository.save(overduePayment);
                            notificationService.sendNotification(memberUserId,
                                    "Your installment for '" + cycle.getGroup().getName() + "' (Cycle #" + cycle.getCycleNumber() + ") is overdue!",
                                    "PAYMENT_OVERDUE");
                        } else {
                            Payment p = existingPayment.get();
                            if (p.getStatus() == Payment.PaymentStatus.PENDING) {
                                p.setStatus(Payment.PaymentStatus.OVERDUE);
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

    public PaymentResponse toPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .cycleId(payment.getCycle().getId())
                .cycleNumber(payment.getCycle().getCycleNumber())
                .memberId(payment.getMember().getId())
                .memberName(payment.getMember().getFullName())
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .paymentDate(payment.getPaymentDate())
                .recordedByName(payment.getRecordedBy() != null ? payment.getRecordedBy().getFullName() : "System Auto-Detected")
                .notes(payment.getNotes())
                .paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod() : "Cash (Offline)")
                .createdAt(payment.getCreatedAt())
                .groupName(payment.getCycle().getGroup().getName())
                .memberPhone(payment.getMember() != null ? payment.getMember().getPhone() : null)
                .memberEmail(payment.getMember() != null ? payment.getMember().getEmail() : null)
                .build();
    }

    public List<PaymentResponse> toPaymentResponseList(List<Payment> payments) {
        return payments.stream().map(this::toPaymentResponse).collect(Collectors.toList());
    }
}
