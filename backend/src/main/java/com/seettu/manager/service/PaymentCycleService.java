package com.seettu.manager.service;

import com.seettu.manager.entity.PaymentCycle;
import com.seettu.manager.entity.SeettuGroup;
import com.seettu.manager.repository.PaymentCycleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentCycleService {

    private final PaymentCycleRepository cycleRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final com.seettu.manager.repository.GroupMemberRepository groupMemberRepository;

    public List<PaymentCycle> getCyclesByGroup(Long groupId) {
        return cycleRepository.findByGroupIdOrderByCycleNumberAsc(groupId);
    }

    public PaymentCycle getCycleById(Long id) {
        return cycleRepository.findById(id)
                .orElseThrow(() -> new com.seettu.manager.exception.ResourceNotFoundException("PaymentCycle", "id", id));
    }

    @Transactional
    public List<PaymentCycle> generateCycles(SeettuGroup group) {
        List<PaymentCycle> cycles = new ArrayList<>();
        LocalDate startDate = LocalDate.now();

        for (int i = 1; i <= group.getMemberCount(); i++) {
            LocalDate endDate;
            switch (group.getCycleFrequency()) {
                case DAILY:
                    endDate = startDate;
                    break;
                case WEEKLY:
                    endDate = startDate.plusWeeks(1).minusDays(1);
                    break;
                case BI_WEEKLY:
                    endDate = startDate.plusWeeks(2).minusDays(1);
                    break;
                case MONTHLY:
                default:
                    endDate = startDate.plusMonths(1).minusDays(1);
                    break;
            }

            PaymentCycle cycle = PaymentCycle.builder()
                    .group(group)
                    .cycleNumber(i)
                    .startDate(startDate)
                    .endDate(endDate)
                    .status(i == 1 ? PaymentCycle.CycleStatus.ACTIVE : PaymentCycle.CycleStatus.PENDING)
                    .build();

            cycles.add(cycleRepository.save(cycle));
            startDate = endDate.plusDays(1);
        }

        return cycles;
    }

    @Transactional
    public PaymentCycle updateCycleStatus(Long cycleId, String status) {
        PaymentCycle cycle = getCycleById(cycleId);
        PaymentCycle.CycleStatus targetStatus = PaymentCycle.CycleStatus.valueOf(status.trim().toUpperCase());
        cycle.setStatus(targetStatus);
        PaymentCycle saved = cycleRepository.save(cycle);

        if (targetStatus == PaymentCycle.CycleStatus.COMPLETED && cycle.getGroup() != null) {
            SeettuGroup group = cycle.getGroup();
            String groupName = (group.getName() != null) ? group.getName() : "Seettu Circle";
            int memberCount = (group.getMemberCount() != null && group.getMemberCount() > 0) ? group.getMemberCount() : 1;
            java.math.BigDecimal potAmount = (group.getContributionAmount() != null)
                    ? group.getContributionAmount().multiply(java.math.BigDecimal.valueOf(memberCount))
                    : java.math.BigDecimal.ZERO;

            String winnerName = (cycle.getPayoutMember() != null) ? cycle.getPayoutMember().getFullName() : "Assigned Winner";

            // 1. Auto-roll next cycle in group to ACTIVE if it exists
            List<PaymentCycle> allGroupCycles = cycleRepository.findByGroupIdOrderByCycleNumberAsc(group.getId());
            int nextCycleNumber = cycle.getCycleNumber() + 1;
            PaymentCycle nextCycle = allGroupCycles.stream()
                    .filter(c -> c.getCycleNumber() == nextCycleNumber)
                    .findFirst()
                    .orElse(null);
            if (nextCycle != null && nextCycle.getStatus() == PaymentCycle.CycleStatus.PENDING) {
                nextCycle.setStatus(PaymentCycle.CycleStatus.ACTIVE);
                cycleRepository.save(nextCycle);
            }

            // 2. Broadcast cycle completion & payout notification to all active circle members
            List<com.seettu.manager.entity.GroupMember> activeMembers = groupMemberRepository.findByGroupIdAndStatus(
                    group.getId(), com.seettu.manager.entity.GroupMember.MemberStatus.ACTIVE);

            String circleBroadcastMsg = "Cycle #" + cycle.getCycleNumber() + " for '" + groupName + "' has officially completed! The total rotational pot of "
                    + potAmount.toPlainString() + " LKR has been disbursed to " + winnerName
                    + ". Payout verification voucher is available for download. "
                    + (nextCycle != null ? "Cycle #" + nextCycleNumber + " is now active." : "All cycles for this circle are now fully completed!");

            for (com.seettu.manager.entity.GroupMember gm : activeMembers) {
                if (gm.getUser() != null && gm.getUser().getId() != null) {
                    try {
                        notificationService.sendNotification(gm.getUser().getId(), circleBroadcastMsg, "CYCLE_COMPLETED");
                    } catch (Exception ignored) {}
                }
            }

            // 3. Send specific confirmation notification to the recipient winner
            if (cycle.getPayoutMember() != null && cycle.getPayoutMember().getId() != null) {
                String winnerMsg = "Congratulations " + winnerName + "! Your rotational payout pot of " + potAmount.toPlainString()
                        + " LKR for Cycle #" + cycle.getCycleNumber() + " in '" + groupName
                        + "' has been officially disbursed to you by your organizer. Your official Payout Verification Voucher has been issued.";
                try {
                    notificationService.sendNotification(cycle.getPayoutMember().getId(), winnerMsg, "PAYOUT_RECEIVED");
                } catch (Exception ignored) {}
            }

            // 4. Audit Log
            try {
                auditLogService.log(
                        cycle.getPayoutMember(),
                        "CYCLE_COMPLETED",
                        "payment_cycles",
                        cycle.getId(),
                        "Cycle #" + cycle.getCycleNumber() + " completed and pot of " + potAmount + " LKR disbursed to " + winnerName + " in group: " + groupName
                );
            } catch (Exception ignored) {}
        }

        return saved;
    }

    @Transactional
    public PaymentCycle assignPayoutMember(Long cycleId, com.seettu.manager.entity.User member) {
        PaymentCycle cycle = getCycleById(cycleId);
        cycle.setPayoutMember(member);
        PaymentCycle saved = cycleRepository.save(cycle);

        if (member != null) {
            String groupName = cycle.getGroup() != null ? cycle.getGroup().getName() : "Seettu Group";
            notificationService.sendNotification(
                    member.getId(),
                    "Congratulations! You have been allocated the payout for Cycle #" + cycle.getCycleNumber() + " in group \"" + groupName + "\".",
                    "PAYOUT"
            );
            auditLogService.log(
                    member,
                    "PAYOUT_ALLOCATED",
                    "payment_cycles",
                    cycle.getId(),
                    "Payout allocated to " + member.getFullName() + " for Cycle #" + cycle.getCycleNumber()
            );
        }
        return saved;
    }

    public List<PaymentCycle> getActiveCycles() {
        return cycleRepository.findByStatus(PaymentCycle.CycleStatus.ACTIVE);
    }

    public List<PaymentCycle> getOverdueCycles(LocalDate date) {
        return cycleRepository.findByEndDateBeforeAndStatus(date, PaymentCycle.CycleStatus.ACTIVE);
    }
}
