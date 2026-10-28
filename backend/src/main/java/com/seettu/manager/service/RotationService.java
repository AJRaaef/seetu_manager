package com.seettu.manager.service;

import com.seettu.manager.dto.RotationAssignmentDto;
import com.seettu.manager.dto.RotationStatusResponse;
import com.seettu.manager.dto.SpinResultResponse;
import com.seettu.manager.entity.*;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.GroupMemberRepository;
import com.seettu.manager.repository.PaymentCycleRepository;
import com.seettu.manager.repository.PaymentRepository;
import com.seettu.manager.repository.RotationAssignmentRepository;
import com.seettu.manager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RotationService {

    private final PaymentCycleRepository cycleRepository;
    private final RotationAssignmentRepository assignmentRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    /**
     * Starts the rotation for a cycle.
     * Validates that all members have PAID contributions.
     * Sets rotation_status = 'IN_PROGRESS'.
     * Automatically assigns position #1 to the Organizer.
     * Notifies all non-organizer members that the wheel is open.
     */
    @Transactional
    public RotationStatusResponse startRotation(Long cycleId) {
        PaymentCycle cycle = cycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentCycle", "id", cycleId));
        SeettuGroup group = cycle.getGroup();
        User organizer = group.getCreatedBy();

        // 1. Cannot re-initialize if already COMPLETED
        if ("COMPLETED".equalsIgnoreCase(cycle.getRotationStatus())) {
            throw new IllegalStateException("Rotation for cycle #" + cycle.getCycleNumber() + " is already completed and locked.");
        }

        // 2. Validate Payment Completeness (all active members must be PAID)
        List<GroupMember> activeMembers = groupMemberRepository.findByGroupIdAndStatus(group.getId(), GroupMember.MemberStatus.ACTIVE);
        if (activeMembers.isEmpty()) {
            throw new IllegalStateException("No active members found in this group.");
        }

        long paidCount = activeMembers.stream().filter(m -> {
            Optional<Payment> p = paymentRepository.findByCycleIdAndMemberId(cycle.getId(), m.getUser().getId());
            return p.isPresent() && p.get().getStatus() == Payment.PaymentStatus.PAID;
        }).count();

        if (paidCount < activeMembers.size()) {
            throw new IllegalStateException(String.format(
                    "Awaiting all members to complete payments before rotation can begin (%d/%d members paid).",
                    paidCount, activeMembers.size()
            ));
        }

        // 3. Set status to IN_PROGRESS
        cycle.setRotationStatus("IN_PROGRESS");
        cycleRepository.save(cycle);

        // 4. Clean up any existing assignments for this cycle
        assignmentRepository.deleteByCycleId(cycle.getId());

        // 5. Automatically assign position #1 to Organizer
        RotationAssignment organizerAssignment = RotationAssignment.builder()
                .cycle(cycle)
                .user(organizer)
                .assignedNumber(1)
                .spinResult("1")
                .spunAt(LocalDateTime.now())
                .build();
        assignmentRepository.save(organizerAssignment);

        // 6. Create pending assignment records for all other active members
        for (GroupMember gm : activeMembers) {
            if (!gm.getUser().getId().equals(organizer.getId())) {
                RotationAssignment memberAssignment = RotationAssignment.builder()
                        .cycle(cycle)
                        .user(gm.getUser())
                        .assignedNumber(null)
                        .spinResult(null)
                        .spunAt(null)
                        .build();
                assignmentRepository.save(memberAssignment);
            }
        }

        // 7. Audit log and member notifications
        auditLogService.log(organizer, "ROTATION_STARTED", "payment_cycles", cycle.getId(),
                "Spinning wheel rotation started for cycle #" + cycle.getCycleNumber());

        try {
            for (GroupMember gm : activeMembers) {
                if (!gm.getUser().getId().equals(organizer.getId())) {
                    notificationService.sendNotification(
                            gm.getUser().getId(),
                            "The spinning wheel for " + group.getName() + " (Cycle #" + cycle.getCycleNumber() + ") is now OPEN! Spin now to draw your payout order.",
                            "ROTATION_STARTED"
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Could not dispatch rotation notifications: {}", e.getMessage());
        }

        return getRotationStatus(cycleId, null);
    }

    /**
     * Backward-compatibility wrapper for startRotation with user context.
     */
    @Transactional
    public RotationStatusResponse initializeRotation(Long cycleId, User user, Integer maxPayoutSlots) {
        if (maxPayoutSlots != null && maxPayoutSlots > 0) {
            setPayoutLimit(cycleId, maxPayoutSlots);
        }
        return startRotation(cycleId);
    }

    /**
     * Sets the limit for how many members can receive a payout order this month.
     */
    @Transactional
    public RotationStatusResponse setPayoutLimit(Long cycleId, Integer limit) {
        if (limit == null || limit < 1) {
            throw new IllegalArgumentException("Payout limit must be at least 1.");
        }
        PaymentCycle cycle = cycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentCycle", "id", cycleId));

        int memberCount = cycle.getGroup().getMemberCount() != null ? cycle.getGroup().getMemberCount() : 10;
        if (limit > memberCount) {
            throw new IllegalArgumentException("Payout limit cannot exceed total group member count (" + memberCount + ").");
        }

        cycle.setMaxPayoutSlots(limit);
        cycleRepository.save(cycle);

        return getRotationStatus(cycleId, null);
    }

    /**
     * Member spins the wheel.
     * Validates user hasn't spun and limit is not reached.
     * Builds available numbers from 2 to memberCount excluding taken numbers plus "NO".
     * Randomly selects using ThreadLocalRandom, saves result, and returns it.
     */
    @Transactional
    public SpinResultResponse spinWheel(Long cycleId, Long userId) {
        PaymentCycle cycle = cycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentCycle", "id", cycleId));
        SeettuGroup group = cycle.getGroup();
        User organizer = group.getCreatedBy();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 1. Organizer is NEVER allowed to spin (Position #1 is reserved)
        if (user.getId().equals(organizer.getId())) {
            throw new IllegalStateException("The group organizer is automatically assigned position #1 and does not spin.");
        }

        // 2. Validate rotation is IN_PROGRESS
        if (!"IN_PROGRESS".equalsIgnoreCase(cycle.getRotationStatus())) {
            throw new IllegalStateException("The spinning wheel is currently locked for this cycle (Status: " + cycle.getRotationStatus() + ").");
        }

        // 3. Validate user is an active member
        GroupMember groupMember = groupMemberRepository.findByGroupIdAndUserId(group.getId(), user.getId())
                .orElseThrow(() -> new IllegalStateException("You are not a registered member of this group."));
        if (groupMember.getStatus() != GroupMember.MemberStatus.ACTIVE) {
            throw new IllegalStateException("Your membership in this group is inactive.");
        }

        // 4. Find user's assignment
        List<RotationAssignment> allAssignments = assignmentRepository.findByCycleIdWithUser(cycle.getId());
        RotationAssignment assignment = allAssignments.stream()
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElse(null);

        if (assignment == null) {
            assignment = RotationAssignment.builder()
                    .cycle(cycle)
                    .user(user)
                    .build();
        }

        // 5. Verify member hasn't spun yet
        if (assignment.getSpunAt() != null) {
            String prior = assignment.getSpinResult() != null ? assignment.getSpinResult() : "a result";
            throw new IllegalStateException("You have already spun the wheel for this cycle! Your result was: " + prior);
        }

        // 6. Check limit condition:
        // The wheel locks after exactly max_payout_slots members have spun, or when all members have spun.
        long nonOrganizerSpunCount = allAssignments.stream()
                .filter(a -> !a.getUser().getId().equals(organizer.getId()) && a.getSpunAt() != null)
                .count();

        Integer maxSlots = cycle.getMaxPayoutSlots();
        if (maxSlots != null && maxSlots > 0 && nonOrganizerSpunCount >= maxSlots) {
            throw new IllegalStateException("The wheel is locked because the maximum payout slots limit (" + maxSlots + ") has been reached for this month.");
        }

        // 7. Determine available numbers from 2 up to total member count
        List<GroupMember> activeMembers = groupMemberRepository.findByGroupIdAndStatus(group.getId(), GroupMember.MemberStatus.ACTIVE);
        int totalMembers = Math.max(activeMembers.size(), group.getMemberCount() != null ? group.getMemberCount() : 2);

        List<Integer> allPossibleNumbers = new ArrayList<>();
        for (int i = 2; i <= totalMembers; i++) {
            allPossibleNumbers.add(i);
        }

        // Taken numbers already won by members (excluding position 1)
        Set<Integer> takenNumbers = allAssignments.stream()
                .map(RotationAssignment::getAssignedNumber)
                .filter(Objects::nonNull)
                .filter(n -> n > 1)
                .collect(Collectors.toSet());

        List<Integer> availableNumbers = allPossibleNumbers.stream()
                .filter(n -> !takenNumbers.contains(n))
                .collect(Collectors.toList());

        // 8. Build available pool: all untaken numbers PLUS exactly one "NO" option
        List<String> pool = new ArrayList<>();
        for (Integer num : availableNumbers) {
            pool.add(String.valueOf(num));
        }
        pool.add("NO");

        // 9. ThreadLocalRandom selection
        int selectedIndex = ThreadLocalRandom.current().nextInt(pool.size());
        String selectedChoice = pool.get(selectedIndex);

        // 10. Update assignment
        assignment.setSpunAt(LocalDateTime.now());
        assignment.setSpinResult(selectedChoice);
        if ("NO".equalsIgnoreCase(selectedChoice)) {
            assignment.setAssignedNumber(null);
        } else {
            assignment.setAssignedNumber(Integer.parseInt(selectedChoice));
        }
        assignmentRepository.save(assignment);

        // Check if now locked
        long updatedSpunCount = nonOrganizerSpunCount + 1;
        long totalNonOrganizerMembers = allAssignments.stream().filter(a -> !a.getUser().getId().equals(organizer.getId())).count();
        boolean isLocked = (maxSlots != null && updatedSpunCount >= maxSlots) || (updatedSpunCount >= totalNonOrganizerMembers);

        // Recalculate remaining available numbers
        List<Integer> updatedAvailable = availableNumbers.stream()
                .filter(n -> !selectedChoice.equals(String.valueOf(n)))
                .collect(Collectors.toList());

        int remainingSpins = maxSlots != null
                ? Math.max(0, maxSlots - (int) updatedSpunCount)
                : (int) (totalNonOrganizerMembers - updatedSpunCount);

        // 11. Audit log
        auditLogService.log(user, "WHEEL_SPUN", "rotation_assignments", assignment.getId(),
                user.getFullName() + " spun the wheel for cycle #" + cycle.getCycleNumber() + " and landed on: " + selectedChoice);

        return SpinResultResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .assignedNumber(assignment.getAssignedNumber())
                .spinResult(assignment.getSpinResult())
                .spunAt(assignment.getSpunAt())
                .isNo("NO".equalsIgnoreCase(selectedChoice))
                .message("NO".equalsIgnoreCase(selectedChoice)
                        ? "You landed on NO! You will wait for the next rotation cycle."
                        : "Congratulations! You won payout position #" + selectedChoice + "!")
                .availableNumbers(updatedAvailable)
                .remainingSpins(remainingSpins)
                .isRotationCompleted(isLocked)
                .build();
    }

    /**
     * Backward-compatibility wrapper for spinWheel with User object.
     */
    @Transactional
    public SpinResultResponse spinWheel(Long cycleId, User user) {
        if (user == null) {
            throw new AccessDeniedException("Authentication required to spin the wheel.");
        }
        return spinWheel(cycleId, user.getId());
    }

    /**
     * Completes and locks the rotation order.
     * Updates payout_member_id on cycle based on results.
     */
    @Transactional
    public RotationStatusResponse completeRotation(Long cycleId) {
        PaymentCycle cycle = cycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentCycle", "id", cycleId));
        SeettuGroup group = cycle.getGroup();
        User organizer = group.getCreatedBy();

        cycle.setRotationStatus("COMPLETED");

        // Determine payout member for this cycle:
        // Position #1 goes to organizer for Cycle 1.
        // For other cycles, match cycleNumber with assignedNumber, or first member who got a number > 1
        List<RotationAssignment> assignments = assignmentRepository.findByCycleIdWithUser(cycle.getId());
        User payoutRecipient = null;

        if (cycle.getCycleNumber() == 1) {
            payoutRecipient = organizer;
        } else {
            for (RotationAssignment ra : assignments) {
                if (ra.getAssignedNumber() != null && ra.getAssignedNumber().equals(cycle.getCycleNumber())) {
                    payoutRecipient = ra.getUser();
                    break;
                }
            }
            if (payoutRecipient == null) {
                payoutRecipient = assignments.stream()
                        .filter(ra -> ra.getAssignedNumber() != null && ra.getAssignedNumber() > 1)
                        .sorted(Comparator.comparingInt(RotationAssignment::getAssignedNumber))
                        .map(RotationAssignment::getUser)
                        .findFirst()
                        .orElse(null);
            }
        }

        if (payoutRecipient != null) {
            cycle.setPayoutMember(payoutRecipient);
        }

        cycleRepository.save(cycle);

        auditLogService.log(organizer, "ROTATION_COMPLETED", "payment_cycles", cycle.getId(),
                "Rotation locked and finalized for cycle #" + cycle.getCycleNumber());

        return getRotationStatus(cycleId, null);
    }

    /**
     * Overloaded completeRotation with User context.
     */
    @Transactional
    public RotationStatusResponse completeRotation(Long cycleId, User user) {
        return completeRotation(cycleId);
    }

    /**
     * Gets the full rotation status for a cycle.
     */
    @Transactional(readOnly = true)
    public RotationStatusResponse getRotationStatus(Long cycleId) {
        return getRotationStatus(cycleId, null);
    }

    /**
     * Gets full rotation status with optional current user context.
     */
    @Transactional(readOnly = true)
    public RotationStatusResponse getRotationStatus(Long cycleId, User currentUser) {
        PaymentCycle cycle = cycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentCycle", "id", cycleId));
        SeettuGroup group = cycle.getGroup();
        User organizer = group.getCreatedBy();

        List<GroupMember> activeMembers = groupMemberRepository.findByGroupIdAndStatus(group.getId(), GroupMember.MemberStatus.ACTIVE);
        int totalMembers = Math.max(activeMembers.size(), group.getMemberCount() != null ? group.getMemberCount() : 1);

        // Check payments
        long paidMembersCount = activeMembers.stream().filter(m -> {
            Optional<Payment> p = paymentRepository.findByCycleIdAndMemberId(cycle.getId(), m.getUser().getId());
            return p.isPresent() && p.get().getStatus() == Payment.PaymentStatus.PAID;
        }).count();

        boolean isFullyPaid = (activeMembers.size() > 0 && paidMembersCount >= activeMembers.size());
        String paymentMessage = isFullyPaid
                ? "All active members have successfully paid for this cycle."
                : String.format("Awaiting all members to complete payments before rotation can begin (%d/%d members paid).",
                        paidMembersCount, activeMembers.size());

        String rotStatus = cycle.getRotationStatus() != null ? cycle.getRotationStatus() : "PENDING";

        // Query assignments
        List<RotationAssignment> assignments = assignmentRepository.findByCycleIdWithUser(cycle.getId());

        boolean isOrganizer = (currentUser != null && organizer != null && currentUser.getId().equals(organizer.getId()));

        // Map DTOs
        List<RotationAssignmentDto> dtos = assignments.stream().map(ra -> {
            boolean isOrg = (organizer != null && ra.getUser().getId().equals(organizer.getId()));
            String status = "PENDING";
            if (ra.getSpunAt() != null) {
                status = "NO".equalsIgnoreCase(ra.getSpinResult()) ? "NO" : "SPUN";
            }
            return RotationAssignmentDto.builder()
                    .id(ra.getId())
                    .userId(ra.getUser().getId())
                    .fullName(ra.getUser().getFullName())
                    .email(ra.getUser().getEmail())
                    .phone(ra.getUser().getPhone())
                    .role(ra.getUser().getRole() != null ? ra.getUser().getRole().name() : "MEMBER")
                    .assignedNumber(ra.getAssignedNumber())
                    .spinResult(ra.getSpinResult())
                    .spunAt(ra.getSpunAt())
                    .status(status)
                    .isOrganizer(isOrg)
                    .build();
        }).collect(Collectors.toList());

        // Find current user's assignment
        RotationAssignmentDto myResult = null;
        boolean hasSpun = false;
        if (currentUser != null) {
            myResult = dtos.stream()
                    .filter(d -> d.getUserId().equals(currentUser.getId()))
                    .findFirst()
                    .orElse(null);
            hasSpun = (myResult != null && myResult.getSpunAt() != null);
        }

        // All possible numbers: from 2 to totalMembers
        List<Integer> allPossibleNumbers = new ArrayList<>();
        for (int i = 2; i <= totalMembers; i++) {
            allPossibleNumbers.add(i);
        }

        // Taken numbers (assigned numbers > 1)
        List<Integer> takenNumbers = assignments.stream()
                .map(RotationAssignment::getAssignedNumber)
                .filter(Objects::nonNull)
                .filter(n -> n > 1)
                .sorted()
                .collect(Collectors.toList());

        Set<Integer> takenSet = new HashSet<>(takenNumbers);
        List<Integer> availableNumbers = allPossibleNumbers.stream()
                .filter(n -> !takenSet.contains(n))
                .collect(Collectors.toList());

        // Non-organizer spun count
        int totalSpinsCompleted = (int) assignments.stream()
                .filter(a -> !a.getUser().getId().equals(organizer.getId()) && a.getSpunAt() != null)
                .count();

        int nonOrganizerMembersCount = (int) assignments.stream()
                .filter(a -> !a.getUser().getId().equals(organizer.getId()))
                .count();

        Integer maxSlots = cycle.getMaxPayoutSlots();
        boolean isLockedByLimit = (maxSlots != null && maxSlots > 0 && totalSpinsCompleted >= maxSlots);
        boolean isAllSpun = (nonOrganizerMembersCount > 0 && totalSpinsCompleted >= nonOrganizerMembersCount);
        boolean isLocked = "COMPLETED".equalsIgnoreCase(rotStatus) || isLockedByLimit || isAllSpun || !isFullyPaid;

        int remainingSpins;
        if (maxSlots != null && maxSlots > 0) {
            remainingSpins = Math.max(0, maxSlots - totalSpinsCompleted);
        } else {
            remainingSpins = Math.max(0, nonOrganizerMembersCount - totalSpinsCompleted);
        }

        boolean canStart = isFullyPaid && !"COMPLETED".equalsIgnoreCase(rotStatus) && !"IN_PROGRESS".equalsIgnoreCase(rotStatus);
        boolean canSpin = !isOrganizer && "IN_PROGRESS".equalsIgnoreCase(rotStatus) && !hasSpun && !isLocked;

        return RotationStatusResponse.builder()
                .cycleId(cycle.getId())
                .cycleNumber(cycle.getCycleNumber())
                .groupId(group.getId())
                .groupName(group.getName())
                .cycleFrequency(group.getCycleFrequency() != null ? group.getCycleFrequency().name() : "MONTHLY")
                .totalMembersCount(totalMembers)
                .paidMembersCount((int) paidMembersCount)
                .isFullyPaid(isFullyPaid)
                .paymentStatusMessage(paymentMessage)
                .rotationStatus(rotStatus)
                .maxPayoutSlots(cycle.getMaxPayoutSlots())
                .organizerId(organizer != null ? organizer.getId() : null)
                .organizerName(organizer != null ? organizer.getFullName() : null)
                .isOrganizer(isOrganizer)
                .canInitialize(canStart)
                .canStart(canStart)
                .canSpin(canSpin)
                .hasSpun(hasSpun)
                .isLocked(isLocked)
                .myResult(myResult)
                .allPossibleNumbers(allPossibleNumbers)
                .takenNumbers(takenNumbers)
                .availableNumbers(availableNumbers)
                .remainingSpins(remainingSpins)
                .totalSpinsCompleted(totalSpinsCompleted)
                .assignments(dtos)
                .build();
    }
}
