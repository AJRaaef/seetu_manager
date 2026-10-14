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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentCycleService paymentCycleService;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

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
            if (existing.getStatus() == Payment.PaymentStatus.PAID) {
                throw new DuplicateResourceException("Payment already recorded for this cycle and member");
            }
            // Update existing pending payment
            existing.setAmount(request.getAmount());
            existing.setStatus(Payment.PaymentStatus.PAID);
            existing.setPaymentDate(LocalDate.now());
            existing.setRecordedBy(recorder);
            existing.setNotes(request.getNotes());
            paymentRepository.save(existing);

            auditLogService.log(recorder, "PAYMENT_UPDATED", "payments", existing.getId(),
                    "Payment updated for member: " + member.getFullName() + " in cycle: " + cycle.getCycleNumber());
            notificationService.sendNotification(member.getId(),
                    "Your payment of " + request.getAmount() + " has been recorded for cycle " + cycle.getCycleNumber(), "PAYMENT");

            return existing;
        }

        // Determine status based on timing and contribution amount
        Payment.PaymentStatus status = Payment.PaymentStatus.PAID;
        if (recorder != null && recorder.getRole() == User.Role.MEMBER) {
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
                .paymentDate(LocalDate.now())
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

    @Transactional(readOnly = true)
    public List<Payment> getAllPayments() {
        return paymentRepository.findAllWithDetails().stream()
                .filter(payment -> payment.getMember() != null && payment.getMember().getRole() != User.Role.ADMIN)
                .collect(Collectors.toList());
    }

    @Transactional
    public Payment updatePayment(Long id, PaymentRecordRequest request) {
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
        Payment updated = paymentRepository.save(payment);

        User recorder = payment.getRecordedBy();
        auditLogService.log(recorder, "PAYMENT_UPDATED", "payments", payment.getId(),
                "Payment #" + payment.getId() + " updated: amount=" + payment.getAmount() + " LKR, status=" + payment.getStatus());

        return updated;
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
        // According to system spec: Mark OVERDUE if no payment recorded within 7 days after due date
        LocalDate cutoffDate = LocalDate.now().minusDays(7);
        List<PaymentCycle> overdueCycles = paymentCycleService.getOverdueCycles(cutoffDate);
        for (PaymentCycle cycle : overdueCycles) {
            List<Payment> pendingPayments = paymentRepository.findByCycleIdAndStatus(
                    cycle.getId(), Payment.PaymentStatus.PENDING);
            for (Payment payment : pendingPayments) {
                payment.setStatus(Payment.PaymentStatus.OVERDUE);
                paymentRepository.save(payment);
                notificationService.sendNotification(payment.getMember().getId(),
                        "Your payment for cycle " + cycle.getCycleNumber() + " is overdue!", "PAYMENT_OVERDUE");
            }
        }
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
                .recordedByName(payment.getRecordedBy() != null ? payment.getRecordedBy().getFullName() : null)
                .notes(payment.getNotes())
                .paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod() : "Cash (Offline)")
                .createdAt(payment.getCreatedAt())
                .groupName(payment.getCycle().getGroup().getName())
                .build();
    }

    public List<PaymentResponse> toPaymentResponseList(List<Payment> payments) {
        return payments.stream().map(this::toPaymentResponse).collect(Collectors.toList());
    }
}
