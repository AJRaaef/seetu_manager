package com.seettu.manager.service;

import com.seettu.manager.dto.ScoreResponse;
import com.seettu.manager.entity.Payment;
import com.seettu.manager.entity.User;
import com.seettu.manager.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DisciplineScoreService {

    private final PaymentRepository paymentRepository;
    private final UserService userService;

    public ScoreResponse calculateScore(Long memberId) {
        User member = userService.getUserById(memberId);
        List<Payment> payments = paymentRepository.findByMemberId(memberId);

        long totalPayments = payments != null ? payments.size() : 0;
        if (totalPayments == 0) {
            return buildResponse(member, 100.0, "EXCELLENT", 0, 0, 0, 0.0);
        }

        long latePayments = payments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.LATE
                        || (p.getStatus() == Payment.PaymentStatus.PAID
                        && p.getCycle() != null
                        && p.getCycle().getEndDate() != null
                        && getPaymentDateForTiming(p) != null
                        && getPaymentDateForTiming(p).isAfter(p.getCycle().getEndDate())))
                .count();

        long missedPayments = payments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.MISSED || p.getStatus() == Payment.PaymentStatus.OVERDUE)
                .count();

        long totalDelayDays = 0;
        long delayedPaymentsCount = 0;

        for (Payment payment : payments) {
            LocalDate dueDate = payment.getCycle() != null ? payment.getCycle().getEndDate() : null;
            boolean unpaidOverdue = payment.getStatus() == Payment.PaymentStatus.OVERDUE
                    || payment.getStatus() == Payment.PaymentStatus.MISSED
                    || payment.getStatus() == Payment.PaymentStatus.PARTIAL;
            LocalDate delayEndDate = unpaidOverdue ? LocalDate.now() : getPaymentDateForTiming(payment);

            if (dueDate != null && delayEndDate != null && delayEndDate.isAfter(dueDate)) {
                long delay = ChronoUnit.DAYS.between(dueDate, delayEndDate);
                totalDelayDays += delay;
                delayedPaymentsCount++;
            } else if (payment.getStatus() == Payment.PaymentStatus.LATE
                    || payment.getStatus() == Payment.PaymentStatus.OVERDUE
                    || payment.getStatus() == Payment.PaymentStatus.MISSED) {
                // When explicitly recorded or marked as LATE, ensure at least 1 day of delay is registered
                totalDelayDays += 1L;
                delayedPaymentsCount++;
            }
        }

        double avgDelayDays = delayedPaymentsCount > 0 ? (double) totalDelayDays / delayedPaymentsCount : 0.0;

        // Formula (SRS REQ-SCR-01): Score = max(0, 100 - [(LatePayments × 5) + (MissedPayments × 10) + (AvgDelayDays × 0.5)])
        double deduction = (latePayments * 5.0) + (missedPayments * 10.0) + (avgDelayDays * 0.5);
        double score = Math.max(0.0, 100.0 - deduction);
        score = Math.min(100.0, score);
        score = Math.round(score * 10.0) / 10.0; // round to 1 decimal place

        String category = determineCategory(score);

        return buildResponse(
                member,
                score,
                category,
                totalPayments,
                latePayments,
                missedPayments,
                Math.round(avgDelayDays * 10.0) / 10.0
        );
    }

    private LocalDate getPaymentDateForTiming(Payment payment) {
        if (payment.getPaymentDate() != null) {
            return payment.getPaymentDate();
        }
        boolean settled = payment.getStatus() == Payment.PaymentStatus.PAID
                || payment.getStatus() == Payment.PaymentStatus.LATE;
        return settled && payment.getCreatedAt() != null ? payment.getCreatedAt().toLocalDate() : null;
    }

    public double getScoreValue(Long memberId) {
        ScoreResponse response = calculateScore(memberId);
        return response.getScore();
    }

    public String determineCategory(double score) {
        if (score >= 90.0) return "EXCELLENT";
        if (score >= 75.0) return "GOOD";
        if (score >= 60.0) return "FAIR";
        if (score >= 40.0) return "POOR";
        return "HIGH_RISK";
    }

    private ScoreResponse buildResponse(User member, double score, String category, long total, long late, long missed, double avgDelay) {
        return ScoreResponse.builder()
                .userId(member.getId())
                .fullName(member.getFullName())
                .score(score)
                .category(category)
                .totalPayments(total)
                .latePayments(late)
                .missedPayments(missed)
                .avgDelayDays(avgDelay)
                .build();
    }
}
