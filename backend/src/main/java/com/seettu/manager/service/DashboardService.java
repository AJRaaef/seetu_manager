package com.seettu.manager.service;

import com.seettu.manager.entity.GroupMember;

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
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
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
    private final DisciplineScoreService disciplineScoreService;
    private final UserRepository userRepository;

    public DashboardResponse getAdminDashboardStats() {
        long totalGroups = groupRepository.count();
        long activeGroups = groupRepository.countByStatus(SeettuGroup.GroupStatus.ACTIVE);
        long totalMembers = memberRepository.countByStatus(GroupMember.MemberStatus.ACTIVE);
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

        // Calculate real monthly cashflow for the last 5 months
        List<Payment> allPayments = paymentRepository.findAll();
        List<PaymentCycle> allCycles = paymentCycleRepository.findAll();
        List<DashboardResponse.MonthlyCashflowDTO> monthlyCashflow = calculateMonthlyCashflow(allPayments, allCycles);

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
                .monthlyCashflow(monthlyCashflow)
                .build();
    }
    
    public DashboardResponse getUserDashboardStats(Long userId) {
        List<SeettuGroup> userGroups = groupRepository.findGroupsByMemberId(userId);
        long totalGroupsJoined = userGroups.size();
        long activeGroups = userGroups.stream().filter(g -> g.getStatus() == SeettuGroup.GroupStatus.ACTIVE).count();
        
        com.seettu.manager.entity.User currentUser = userRepository.findById(userId).orElse(null);
        boolean isOrganizer = currentUser != null && currentUser.getRole() == com.seettu.manager.entity.User.Role.ORGANIZER;

        List<Payment> userPayments;
        if (isOrganizer) {
            List<Long> organizedGroupIds = userGroups.stream()
                    .filter(g -> g.getCreatedBy() != null && g.getCreatedBy().getId().equals(userId))
                    .map(SeettuGroup::getId)
                    .toList();
            if (!organizedGroupIds.isEmpty()) {
                userPayments = paymentRepository.findAll().stream()
                        .filter(p -> p.getCycle() != null && p.getCycle().getGroup() != null && organizedGroupIds.contains(p.getCycle().getGroup().getId()))
                        .toList();
            } else {
                userPayments = paymentRepository.findByMemberId(userId);
            }
        } else {
            userPayments = paymentRepository.findByMemberId(userId);
        }
        long totalPayments = userPayments.size();
        long paidPaymentsCount = userPayments.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.PAID).count();
        long pendingPayments = userPayments.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.PENDING).count();
        long overduePayments = userPayments.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.OVERDUE).count();
        long latePayments = userPayments.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.LATE).count();
        
        // Calculate real DB completion rate: percentage of rotational cycles completed in user's groups (starts at 0% for new members)
        long totalExpectedCycles = 0;
        long totalCompletedCycles = 0;
        for (SeettuGroup g : userGroups) {
            int gTotal = (g.getMemberCount() != null && g.getMemberCount() > 0) ? g.getMemberCount() : 0;
            List<PaymentCycle> gCycles = paymentCycleRepository.findByGroupIdOrderByCycleNumberAsc(g.getId());
            if (!gCycles.isEmpty() && gCycles.size() > gTotal) {
                gTotal = gCycles.size();
            }
            long gComp = gCycles.stream().filter(c -> c.getStatus() == PaymentCycle.CycleStatus.COMPLETED).count();
            if (g.getStatus() == SeettuGroup.GroupStatus.COMPLETED) {
                gComp = gTotal;
            }
            totalExpectedCycles += gTotal;
            totalCompletedCycles += gComp;
        }
        double completionRate = totalExpectedCycles > 0 ? ((double) totalCompletedCycles / totalExpectedCycles) * 100.0 : 0.0;

        // Calculate Discipline Score dynamically using the unified DisciplineScoreService engine
        int calculatedScore = disciplineScoreService.getScoreValue(userId);

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

        long totalGroupMembers = userGroups.stream()
                .filter(g -> g.getStatus() == SeettuGroup.GroupStatus.ACTIVE || g.getStatus() == SeettuGroup.GroupStatus.COMPLETED)
                .flatMap(g -> memberRepository.findByGroupIdAndStatus(g.getId(), GroupMember.MemberStatus.ACTIVE).stream())
                .map(gm -> gm.getUser() != null ? gm.getUser().getId() : null)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count();

        Map<String, Long> paymentStatusDistribution = new HashMap<>();
        paymentStatusDistribution.put("PAID", paidPaymentsCount);
        paymentStatusDistribution.put("PENDING", pendingPayments);
        paymentStatusDistribution.put("LATE", latePayments);
        paymentStatusDistribution.put("OVERDUE", overduePayments);

        List<PaymentCycle> userCycles = userGroups.stream()
                .flatMap(g -> paymentCycleRepository.findByGroupIdOrderByCycleNumberAsc(g.getId()).stream())
                .toList();
        List<DashboardResponse.MonthlyCashflowDTO> userMonthlyCashflow = calculateMonthlyCashflow(userPayments, userCycles);

        return DashboardResponse.builder()
                .totalGroups(totalGroupsJoined)
                .activeGroups(activeGroups)
                .totalMembers(totalGroupMembers)
                .totalPayments(totalPayments)
                .pendingPayments(pendingPayments)
                .overduePayments(overduePayments)
                .reportsGenerated(userReports)
                .certificatesEarned(userCertificates)
                .disciplineScore(calculatedScore)
                .nextPaymentDueDays(nextDueDays)
                .overallCompletionRate(completionRate)
                .paymentStatusDistribution(paymentStatusDistribution)
                .monthlyCashflow(userMonthlyCashflow)
                .build();
    }

    private List<DashboardResponse.MonthlyCashflowDTO> calculateMonthlyCashflow(List<Payment> payments, List<PaymentCycle> cycles) {
        List<DashboardResponse.MonthlyCashflowDTO> result = new ArrayList<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = 4; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now.minusMonths(i));
            String label = ym.format(monthFormatter);

            double inflow = payments.stream()
                    .filter(p -> p.getStatus() == Payment.PaymentStatus.PAID)
                    .filter(p -> {
                        LocalDate d = p.getPaymentDate() != null ? p.getPaymentDate() : (p.getCreatedAt() != null ? p.getCreatedAt().toLocalDate() : null);
                        return d != null && YearMonth.from(d).equals(ym);
                    })
                    .mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0)
                    .sum();

            double outflow = cycles.stream()
                    .filter(c -> c.getPayoutMember() != null)
                    .filter(c -> {
                        LocalDate d = c.getStartDate() != null ? c.getStartDate() : null;
                        return d != null && YearMonth.from(d).equals(ym);
                    })
                    .mapToDouble(c -> {
                        if (c.getGroup() != null && c.getGroup().getContributionAmount() != null && c.getGroup().getMemberCount() != null) {
                            return c.getGroup().getContributionAmount().doubleValue() * c.getGroup().getMemberCount();
                        }
                        return 0.0;
                    })
                    .sum();

            result.add(DashboardResponse.MonthlyCashflowDTO.builder()
                    .month(label)
                    .inflow(inflow)
                    .outflow(outflow)
                    .build());
        }
        return result;
    }
}
