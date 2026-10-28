package com.seettu.manager.service;

import com.seettu.manager.entity.PaymentCycle;
import com.seettu.manager.entity.SeettuGroup;
import com.seettu.manager.entity.User;
import com.seettu.manager.repository.PaymentCycleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentCycleService {

    private final PaymentCycleRepository cycleRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final com.seettu.manager.repository.GroupMemberRepository groupMemberRepository;
    private final com.seettu.manager.repository.SeettuGroupRepository groupRepository;

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

            User initialPayoutMember = null;
            if (i == 1 && group.getCreatedBy() != null) {
                // By traditional Seettu law & custom, the organizer receives the 1st cycle fund
                initialPayoutMember = group.getCreatedBy();
            }

            PaymentCycle cycle = PaymentCycle.builder()
                    .group(group)
                    .cycleNumber(i)
                    .startDate(startDate)
                    .endDate(endDate)
                    .status(i == 1 && (group.getMemberCount() != null && group.getMemberCount() <= 1) ? PaymentCycle.CycleStatus.ACTIVE : PaymentCycle.CycleStatus.PENDING)
                    .payoutMember(initialPayoutMember)
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
            int memberCount = (group.getMemberCount() != null && group.getMemberCount() > 0) ? group.getMemberCount() : 1;
            List<com.seettu.manager.entity.GroupMember> activeMembers = groupMemberRepository.findByGroupIdAndStatus(
                    group.getId(), com.seettu.manager.entity.GroupMember.MemberStatus.ACTIVE);

            // Statutory Seettu Rule: A cycle CANNOT complete unless the circle has reached full capacity
            if (activeMembers.size() < memberCount) {
                throw new IllegalStateException("Cannot complete cycle: Circle requires " + memberCount 
                        + " members but currently only has " + activeMembers.size() + " active members. Circle must reach full capacity before cycle can complete.");
            }

            String groupName = (group.getName() != null) ? group.getName() : "Seettu Circle";
            java.math.BigDecimal potAmount = (group.getContributionAmount() != null)
                    ? group.getContributionAmount().multiply(java.math.BigDecimal.valueOf(memberCount))
                    : java.math.BigDecimal.ZERO;

            // Auto-assign payout member if null: Cycle 1 always goes to the Organizer, subsequent cycles rotate among other members
            if (cycle.getPayoutMember() == null) {
                if (cycle.getCycleNumber() == 1) {
                    User organizer = group.getCreatedBy();
                    if (organizer == null && !activeMembers.isEmpty()) {
                        organizer = activeMembers.stream()
                                .map(com.seettu.manager.entity.GroupMember::getUser)
                                .filter(u -> u != null && u.getRole() == User.Role.ORGANIZER)
                                .findFirst()
                                .orElse(activeMembers.get(0).getUser());
                    }
                    if (organizer != null) {
                        cycle.setPayoutMember(organizer);
                        cycleRepository.save(cycle);
                    }
                } else if (!activeMembers.isEmpty()) {
                    Long organizerId = group.getCreatedBy() != null ? group.getCreatedBy().getId() : null;
                    List<User> otherMembers = activeMembers.stream()
                            .map(com.seettu.manager.entity.GroupMember::getUser)
                            .filter(u -> u != null && (organizerId == null || !u.getId().equals(organizerId)))
                            .toList();

                    User autoWinner = !otherMembers.isEmpty()
                            ? otherMembers.get((cycle.getCycleNumber() - 2) % otherMembers.size())
                            : activeMembers.get((cycle.getCycleNumber() - 1) % activeMembers.size()).getUser();

                    if (autoWinner != null) {
                        cycle.setPayoutMember(autoWinner);
                        cycleRepository.save(cycle);
                    }
                }
            }

            String winnerName = (cycle.getPayoutMember() != null) ? cycle.getPayoutMember().getFullName() : "Assigned Winner";

            // 1. Auto-roll next cycle in group to ACTIVE if it exists
            List<PaymentCycle> allGroupCycles = cycleRepository.findByGroupIdOrderByCycleNumberAsc(group.getId());
            int nextCycleNumber = cycle.getCycleNumber() + 1;
            PaymentCycle nextCycle = allGroupCycles.stream()
                    .filter(c -> c.getCycleNumber() == nextCycleNumber)
                    .findFirst()
                    .orElse(null);
            if (nextCycle != null) {
                if (nextCycle.getStatus() == PaymentCycle.CycleStatus.PENDING) {
                    nextCycle.setStatus(PaymentCycle.CycleStatus.ACTIVE);
                    cycleRepository.save(nextCycle);
                }
                // Auto-assign next cycle's payout member if null: Cycle 1 to organizer, others to remaining members
                if (nextCycle.getPayoutMember() == null) {
                    if (nextCycle.getCycleNumber() == 1) {
                        User organizer = group.getCreatedBy();
                        if (organizer != null) {
                            nextCycle.setPayoutMember(organizer);
                            cycleRepository.save(nextCycle);
                        }
                    } else if (!activeMembers.isEmpty()) {
                        Long organizerId = group.getCreatedBy() != null ? group.getCreatedBy().getId() : null;
                        List<User> otherMembers = activeMembers.stream()
                                .map(com.seettu.manager.entity.GroupMember::getUser)
                                .filter(u -> u != null && (organizerId == null || !u.getId().equals(organizerId)))
                                .toList();

                        User nextWinner = !otherMembers.isEmpty()
                                ? otherMembers.get((nextCycle.getCycleNumber() - 2) % otherMembers.size())
                                : activeMembers.get((nextCycle.getCycleNumber() - 1) % activeMembers.size()).getUser();

                        if (nextWinner != null) {
                            nextCycle.setPayoutMember(nextWinner);
                            cycleRepository.save(nextCycle);
                        }
                    }
                }
            }

            // If all cycles in group are now completed, mark group as COMPLETED
            boolean hasIncompleteCycles = allGroupCycles.stream()
                    .anyMatch(c -> !c.getId().equals(cycle.getId()) && c.getStatus() != PaymentCycle.CycleStatus.COMPLETED);
            if (!hasIncompleteCycles) {
                group.setStatus(SeettuGroup.GroupStatus.COMPLETED);
                groupRepository.save(group);
            }

            // 2. Broadcast cycle completion & payout notification to all active circle members
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

            // Broadcast upcoming payout notice for the next cycle to all members
            if (nextCycle != null) {
                String nextRecipient = (nextCycle.getPayoutMember() != null) ? nextCycle.getPayoutMember().getFullName() : "Assigned Member";
                String upcomingNotice = "Upcoming Payout Notice: Cycle #" + nextCycleNumber + " for '" + groupName
                        + "' is now in progress! Scheduled rotational payout of " + potAmount.toPlainString()
                        + " LKR to " + nextRecipient + " on or before " + nextCycle.getEndDate() + ". Track it in your dashboard.";
                for (com.seettu.manager.entity.GroupMember gm : activeMembers) {
                    if (gm.getUser() != null && gm.getUser().getId() != null) {
                        try {
                            notificationService.sendNotification(gm.getUser().getId(), upcomingNotice, "UPCOMING_PAYOUT");
                        } catch (Exception ignored) {}
                    }
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

    @Transactional
    public List<PaymentCycle> conductKulukkalDraw(Long groupId) {
        SeettuGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new com.seettu.manager.exception.ResourceNotFoundException("SeettuGroup", "id", groupId));

        List<PaymentCycle> cycles = cycleRepository.findByGroupIdOrderByCycleNumberAsc(groupId);
        if (cycles.isEmpty()) {
            throw new IllegalArgumentException("No payment cycles found for this group to conduct Kulukkal draw.");
        }

        List<com.seettu.manager.entity.GroupMember> activeMembers = groupMemberRepository.findByGroupIdAndStatus(
                groupId, com.seettu.manager.entity.GroupMember.MemberStatus.ACTIVE);

        if (activeMembers.isEmpty()) {
            throw new IllegalArgumentException("No active members enrolled in this group to conduct Kulukkal draw.");
        }

        // 1. Identify the Organizer for Cycle 1
        User organizer = group.getCreatedBy();
        if (organizer == null) {
            organizer = activeMembers.stream()
                    .map(com.seettu.manager.entity.GroupMember::getUser)
                    .filter(u -> u != null && u.getRole() == User.Role.ORGANIZER)
                    .findFirst()
                    .orElse(activeMembers.get(0).getUser());
        }

        final Long organizerId = organizer != null ? organizer.getId() : null;

        // 2. Identify remaining enrolled members for Cycles 2..N
        List<User> otherMembers = activeMembers.stream()
                .map(com.seettu.manager.entity.GroupMember::getUser)
                .filter(u -> u != null && (organizerId == null || !u.getId().equals(organizerId)))
                .collect(Collectors.toList());

        // Cryptographically secure shuffle for authentic, fair Kulukkal lot drawing
        Collections.shuffle(otherMembers, new java.security.SecureRandom());

        StringBuilder drawSummary = new StringBuilder();

        for (PaymentCycle cycle : cycles) {
            if (cycle.getCycleNumber() == 1) {
                // Cycle 1: Strictly reserved for Organizer
                cycle.setPayoutMember(organizer);
                cycleRepository.save(cycle);
                drawSummary.append("Cycle #1: ").append(organizer != null ? organizer.getFullName() : "Organizer").append(" (Organizer Turn), ");
            } else {
                // Cycles 2..N: Drawn fairly from remaining members
                int memberIdx = cycle.getCycleNumber() - 2;
                User recipient;
                if (!otherMembers.isEmpty()) {
                    recipient = otherMembers.get(memberIdx % otherMembers.size());
                } else {
                    recipient = activeMembers.get((cycle.getCycleNumber() - 1) % activeMembers.size()).getUser();
                }
                cycle.setPayoutMember(recipient);
                cycleRepository.save(cycle);
                drawSummary.append("Cycle #").append(cycle.getCycleNumber()).append(": ").append(recipient != null ? recipient.getFullName() : "Member").append(", ");
            }
        }

        // 3. Broadcast Kulukkal draw notification to all circle members
        String groupName = group.getName() != null ? group.getName() : "Seettu Circle";
        String broadcastMsg = "Kulukkal Lot Drawing Completed for '" + groupName + "'! Cycle #1 is allocated to the Organizer (" 
                + (organizer != null ? organizer.getFullName() : "Organizer") 
                + "). Subsequent cycles were fairly drawn. View the full rotation schedule in your group dashboard.";

        for (com.seettu.manager.entity.GroupMember gm : activeMembers) {
            if (gm.getUser() != null && gm.getUser().getId() != null) {
                try {
                    notificationService.sendNotification(gm.getUser().getId(), broadcastMsg, "KULUKKAL_DRAW");
                } catch (Exception ignored) {}
            }
        }

        // 4. Audit log
        try {
            auditLogService.log(
                    organizer,
                    "KULUKKAL_DRAW_COMPLETED",
                    "payment_cycles",
                    groupId,
                    "Kulukkal lot draw conducted for group '" + groupName + "'. Results: " + drawSummary
            );
        } catch (Exception ignored) {}

        return cycleRepository.findByGroupIdOrderByCycleNumberAsc(groupId);
    }

    @Transactional
    public PaymentCycle conductSingleKulukkalDraw(Long cycleId) {
        PaymentCycle cycle = getCycleById(cycleId);
        SeettuGroup group = cycle.getGroup();
        if (group == null) {
            throw new IllegalArgumentException("Cycle does not belong to a valid group.");
        }

        List<com.seettu.manager.entity.GroupMember> activeMembers = groupMemberRepository.findByGroupIdAndStatus(
                group.getId(), com.seettu.manager.entity.GroupMember.MemberStatus.ACTIVE);

        if (activeMembers.isEmpty()) {
            throw new IllegalArgumentException("No active members in group.");
        }

        User winner;
        if (cycle.getCycleNumber() == 1) {
            winner = group.getCreatedBy();
            if (winner == null) {
                winner = activeMembers.get(0).getUser();
            }
        } else {
            // Find members who haven't won any other cycle yet
            List<PaymentCycle> allCycles = cycleRepository.findByGroupIdOrderByCycleNumberAsc(group.getId());
            List<Long> alreadyAwardedIds = allCycles.stream()
                    .filter(c -> !c.getId().equals(cycle.getId()) && c.getPayoutMember() != null)
                    .map(c -> c.getPayoutMember().getId())
                    .toList();

            Long organizerId = group.getCreatedBy() != null ? group.getCreatedBy().getId() : null;
            List<User> eligible = activeMembers.stream()
                    .map(com.seettu.manager.entity.GroupMember::getUser)
                    .filter(u -> u != null && !alreadyAwardedIds.contains(u.getId()) && (organizerId == null || !u.getId().equals(organizerId)))
                    .collect(Collectors.toList());

            if (eligible.isEmpty()) {
                eligible = activeMembers.stream()
                        .map(com.seettu.manager.entity.GroupMember::getUser)
                        .filter(u -> u != null && !alreadyAwardedIds.contains(u.getId()))
                        .collect(Collectors.toList());
            }

            if (eligible.isEmpty()) {
                eligible = activeMembers.stream().map(com.seettu.manager.entity.GroupMember::getUser).collect(Collectors.toList());
            }

            Collections.shuffle(eligible, new java.security.SecureRandom());
            winner = eligible.get(0);
        }

        cycle.setPayoutMember(winner);
        PaymentCycle saved = cycleRepository.save(cycle);

        String groupName = group.getName() != null ? group.getName() : "Seettu Group";
        String notice = "Kulukkal Winner Drawn! For Cycle #" + cycle.getCycleNumber() + " in '" + groupName + "', the winning lot chit was drawn for " + winner.getFullName() + ".";
        for (com.seettu.manager.entity.GroupMember gm : activeMembers) {
            if (gm.getUser() != null && gm.getUser().getId() != null) {
                try {
                    notificationService.sendNotification(gm.getUser().getId(), notice, "KULUKKAL_DRAW");
                } catch (Exception ignored) {}
            }
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
