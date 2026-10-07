package com.seettu.manager.service;

import com.seettu.manager.dto.ScoreResponse;
import com.seettu.manager.entity.Payment;
import com.seettu.manager.entity.User;
import com.seettu.manager.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

        long totalPayments = payments.size();
        if (totalPayments == 0) {
            return buildResponse(member, 100.0, "EXCELLENT", 0, 0, 0, 0.0);
        }

        long latePayments = payments.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.LATE).count();
        long missedPayments = payments.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.MISSED || p.getStatus() == Payment.PaymentStatus.OVERDUE).count();
        
        long totalDelayDays = 0;
        long delayedPaymentsCount = 0;
        
        for (Payment payment : payments) {
            if ((payment.getStatus() == Payment.PaymentStatus.LATE || payment.getStatus() == Payment.PaymentStatus.PAID) 
                && payment.getPaymentDate() != null 
                && payment.getCycle().getEndDate() != null) {
                
                if (payment.getPaymentDate().isAfter(payment.getCycle().getEndDate())) {
                    long delay = ChronoUnit.DAYS.between(payment.getCycle().getEndDate(), payment.getPaymentDate());
                    totalDelayDays += delay;
                    delayedPaymentsCount++;
                }
            }
        }

        double avgDelayDays = delayedPaymentsCount > 0 ? (double) totalDelayDays / delayedPaymentsCount : 0.0;

        // Formula: Score = 100 - [(LatePayments × 5) + (MissedPayments × 10) + (AvgDelayDays × 0.5)]
        double deduction = (latePayments * 5) + (missedPayments * 10) + (avgDelayDays * 0.5);
        double score = Math.max(0, 100 - deduction); // Minimum score is 0

        String category = determineCategory(score);

        return buildResponse(member, score, category, totalPayments, latePayments, missedPayments, avgDelayDays);
    }

    private String determineCategory(double score) {
        if (score >= 90) return "EXCELLENT";
        if (score >= 75) return "GOOD";
        if (score >= 60) return "FAIR";
        if (score >= 40) return "POOR";
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
