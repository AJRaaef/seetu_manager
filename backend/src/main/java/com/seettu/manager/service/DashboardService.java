package com.seettu.manager.service;

import com.seettu.manager.dto.DashboardResponse;
import com.seettu.manager.entity.Dispute;
import com.seettu.manager.entity.EmergencyRequest;
import com.seettu.manager.entity.Payment;
import com.seettu.manager.entity.PaymentCycle;
import com.seettu.manager.entity.SeettuGroup;
import com.seettu.manager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SeettuGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentCycleRepository paymentCycleRepository;
    private final DisputeRepository disputeRepository;
    private final EmergencyRequestRepository emergencyRepository;
    private final ReportRepository reportRepository;
    private final CertificateRepository certificateRepository;

    public DashboardResponse getAdminDashboardStats() {
        long totalGroups = groupRepository.count();
        long activeGroups = groupRepository.countByStatus(SeettuGroup.GroupStatus.ACTIVE);
        long totalMembers = memberRepository.count();
        long totalPayments = paymentRepository.count();
        long pendingPayments = paymentRepository.findByStatus(Payment.PaymentStatus.PENDING).size();
        long overduePayments = paymentRepository.findByStatus(Payment.PaymentStatus.OVERDUE).size();
        long openDisputes = disputeRepository.countByStatus(Dispute.DisputeStatus.OPEN);
        long pendingEmergencies = emergencyRepository.countByStatus(EmergencyRequest.EmergencyStatus.PENDING);
        long reportsGenerated = reportRepository.count();
        long certificatesEarned = certificateRepository.count();

        Map<String, Long> groupStatusDistribution = new HashMap<>();
        groupStatusDistribution.put("ACTIVE", activeGroups);
        groupStatusDistribution.put("PENDING", groupRepository.countByStatus(SeettuGroup.GroupStatus.PENDING));
        groupStatusDistribution.put("COMPLETED", groupRepository.countByStatus(SeettuGroup.GroupStatus.COMPLETED));

        Map<String, Long> paymentStatusDistribution = new HashMap<>();
        paymentStatusDistribution.put("PAID", (long) paymentRepository.findByStatus(Payment.PaymentStatus.PAID).size());
        paymentStatusDistribution.put("PENDING", pendingPayments);
        paymentStatusDistribution.put("LATE", (long) paymentRepository.findByStatus(Payment.PaymentStatus.LATE).size());
        paymentStatusDistribution.put("OVERDUE", overduePayments);

        // Calculate next payment due days from earliest active cycle in DB
        List<PaymentCycle> activeCycles = paymentCycleRepository.findByStatus(PaymentCycle.CycleStatus.ACTIVE);
        int nextDueDays = 5;
        if (!activeCycles.isEmpty() && activeCycles.get(0).getEndDate() != null) {
            long daysBetween = ChronoUnit.DAYS.between(LocalDate.now(), activeCycles.get(0).getEndDate());
            nextDueDays = (int) Math.max(0, daysBetween);
        }

        return DashboardResponse.builder()
                .totalGroups(totalGroups)
                .activeGroups(activeGroups)
                .totalMembers(totalMembers)
                .totalPayments(totalPayments)
                .pendingPayments(pendingPayments)
                .overduePayments(overduePayments)
                .openDisputes(openDisputes)
                .pendingEmergencies(pendingEmergencies)
                .reportsGenerated(reportsGenerated)
                .certificatesEarned(certificatesEarned)
                .disciplineScore(95)
                .nextPaymentDueDays(nextDueDays)
                .groupStatusDistribution(groupStatusDistribution)
                .paymentStatusDistribution(paymentStatusDistribution)
                .build();
    }
    
    public DashboardResponse getUserDashboardStats(Long userId) {
        List<SeettuGroup> userGroups = groupRepository.findGroupsByMemberId(userId);
        long totalGroupsJoined = userGroups.size();
        long activeGroups = userGroups.stream().filter(g -> g.getStatus() == SeettuGroup.GroupStatus.ACTIVE).count();
        
        List<Payment> userPayments = paymentRepository.findByMemberId(userId);
        long totalPayments = userPayments.size();
        long paidPaymentsCount = userPayments.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.PAID).count();
        long pendingPayments = userPayments.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.PENDING).count();
        long overduePayments = userPayments.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.OVERDUE).count();
        long latePayments = userPayments.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.LATE).count();
        
        double completionRate = totalPayments > 0 ? (double) paidPaymentsCount / totalPayments * 100 : 100.0;

        // Calculate Discipline Score dynamically from real DB payments: 100 base - (10 * overdue) - (5 * late)
        int calculatedScore = 100 - (int)(overduePayments * 10) - (int)(latePayments * 5);
        if (calculatedScore < 50) calculatedScore = 50;
        if (calculatedScore > 100) calculatedScore = 100;

        // Calculate real DB count of certificates earned by user
        long userCertificates = certificateRepository.findByUserId(userId).size();

        // Calculate real DB count of reports generated by user
        long userReports = reportRepository.findByGeneratedById(userId).size();

        // Calculate real DB Next Payment Due Days for this user from active group cycles
        int nextDueDays = 5;
        for (SeettuGroup g : userGroups) {
            List<PaymentCycle> groupActiveCycles = paymentCycleRepository.findByGroupIdAndStatus(g.getId(), PaymentCycle.CycleStatus.ACTIVE);
            if (!groupActiveCycles.isEmpty() && groupActiveCycles.get(0).getEndDate() != null) {
                long days = ChronoUnit.DAYS.between(LocalDate.now(), groupActiveCycles.get(0).getEndDate());
                nextDueDays = (int) Math.max(0, days);
                break;
            }
        }

        Map<String, Long> paymentStatusDistribution = new HashMap<>();
        paymentStatusDistribution.put("PAID", paidPaymentsCount);
        paymentStatusDistribution.put("PENDING", pendingPayments);
        paymentStatusDistribution.put("LATE", latePayments);
        paymentStatusDistribution.put("OVERDUE", overduePayments);

        return DashboardResponse.builder()
                .totalGroups(totalGroupsJoined)
                .activeGroups(activeGroups)
                .totalPayments(totalPayments)
                .pendingPayments(pendingPayments)
                .overduePayments(overduePayments)
                .reportsGenerated(userReports)
                .certificatesEarned(userCertificates)
                .disciplineScore(calculatedScore)
                .nextPaymentDueDays(nextDueDays)
                .overallCompletionRate(completionRate)
                .paymentStatusDistribution(paymentStatusDistribution)
                .build();
    }
}
