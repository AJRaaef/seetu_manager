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

        // Determine status based on timing
        Payment.PaymentStatus status = Payment.PaymentStatus.PAID;
        if (LocalDate.now().isAfter(cycle.getEndDate())) {
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
                .build();

        payment = paymentRepository.save(payment);

        auditLogService.log(recorder, "PAYMENT_RECORDED", "payments", payment.getId(),
                "Payment recorded for member: " + member.getFullName() + " in cycle: " + cycle.getCycleNumber());
        notificationService.sendNotification(member.getId(),
                "Your payment of " + request.getAmount() + " has been recorded for cycle " + cycle.getCycleNumber(), "PAYMENT");

        return payment;
    }

    public List<Payment> getPaymentsByGroup(Long groupId) {
        return paymentRepository.findByGroupId(groupId);
    }

    public List<Payment> getPaymentsByMember(Long memberId) {
        return paymentRepository.findByMemberId(memberId);
    }

    public List<Payment> getPaymentsByCycle(Long cycleId) {
        return paymentRepository.findByCycleId(cycleId);
    }

    public List<Payment> getPaymentsByGroupAndMember(Long groupId, Long memberId) {
        return paymentRepository.findByGroupIdAndMemberId(groupId, memberId);
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
                .createdAt(payment.getCreatedAt())
                .groupName(payment.getCycle().getGroup().getName())
                .build();
    }

    public List<PaymentResponse> toPaymentResponseList(List<Payment> payments) {
        return payments.stream().map(this::toPaymentResponse).collect(Collectors.toList());
    }
}
