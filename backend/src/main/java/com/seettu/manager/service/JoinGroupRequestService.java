package com.seettu.manager.service;

import com.seettu.manager.entity.GroupMember;
import com.seettu.manager.entity.JoinGroupRequest;
import com.seettu.manager.entity.SeettuGroup;
import com.seettu.manager.entity.User;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.GroupMemberRepository;
import com.seettu.manager.repository.JoinGroupRequestRepository;
import com.seettu.manager.repository.SeettuGroupRepository;
import com.seettu.manager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JoinGroupRequestService {

    private final JoinGroupRequestRepository joinGroupRequestRepository;
    private final SeettuGroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final NotificationService notificationService;
    private final com.seettu.manager.repository.MemberVerificationRepository memberVerificationRepository;
    private final com.seettu.manager.repository.PaymentCycleRepository cycleRepository;

    @Transactional
    public JoinGroupRequest createJoinRequest(Long groupId, Long userId) {
        SeettuGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("SeettuGroup", "id", groupId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new IllegalArgumentException("You are already an active member of this group. Duplicate membership is prohibited.");
        }

        long activeMembers = groupMemberRepository.countByGroupIdAndStatus(groupId, GroupMember.MemberStatus.ACTIVE);
        if (activeMembers >= group.getMemberCount()) {
            throw new IllegalArgumentException("Group has reached maximum member count");
        }

        boolean isVerified = (user.getKycStatus() == User.KycStatus.VERIFIED) ||
                memberVerificationRepository.findByUserId(userId)
                        .map(v -> v.getVerificationStatus() == com.seettu.manager.entity.VerificationStatus.VERIFIED)
                        .orElse(false);

        if (user.getRole() == User.Role.MEMBER && !isVerified) {
            throw new IllegalStateException("Please complete your identity verification first. Go to Verification page.");
        }

        if (joinGroupRequestRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, JoinGroupRequest.RequestStatus.PENDING)) {
            throw new IllegalArgumentException("You already have a pending join request for this group.");
        }

        JoinGroupRequest request = JoinGroupRequest.builder()
                .group(group)
                .user(user)
                .status(JoinGroupRequest.RequestStatus.PENDING)
                .build();

        request = joinGroupRequestRepository.save(request);

        // Notify group organizer
        if (group.getCreatedBy() != null) {
            notificationService.sendNotification(
                    group.getCreatedBy().getId(),
                    "New join request from " + user.getFullName() + " for group: " + group.getName(),
                    "JOIN_REQUEST"
            );
        }

        return request;
    }

    @Transactional(readOnly = true)
    public List<JoinGroupRequest> getPendingRequests() {
        return joinGroupRequestRepository.findAllWithDetailsByStatus(JoinGroupRequest.RequestStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public List<JoinGroupRequest> getRequestsByUser(Long userId) {
        return joinGroupRequestRepository.findByUserId(userId);
    }

    @Transactional
    public JoinGroupRequest approveRequest(Long requestId) {
        JoinGroupRequest request = joinGroupRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("JoinGroupRequest", "id", requestId));

        if (request.getUser().getRole() == User.Role.MEMBER && request.getUser().getKycStatus() != User.KycStatus.VERIFIED) {
            throw new IllegalStateException("Cannot approve join request: Member '" + request.getUser().getFullName() + 
                    "' has not completed Admin identity and Grama Niladhari Certificate verification.");
        }

        long activeMembers = groupMemberRepository.countByGroupIdAndStatus(request.getGroup().getId(), GroupMember.MemberStatus.ACTIVE);
        if (activeMembers >= request.getGroup().getMemberCount()) {
            throw new IllegalArgumentException("Group has reached maximum member count");
        }

        request.setStatus(JoinGroupRequest.RequestStatus.APPROVED);
        joinGroupRequestRepository.save(request);

        // Add user to GroupMember if not already present
        boolean alreadyMember = groupMemberRepository.existsByGroupIdAndUserId(
                request.getGroup().getId(), request.getUser().getId());

        if (!alreadyMember) {
            GroupMember member = GroupMember.builder()
                    .group(request.getGroup())
                    .user(request.getUser())
                    .status(GroupMember.MemberStatus.ACTIVE)
                    .build();
            groupMemberRepository.save(member);
        }

        // Notify member
        notificationService.sendNotification(
                request.getUser().getId(),
                "Your request to join group '" + request.getGroup().getName() + "' has been approved!",
                "JOIN_APPROVED"
        );

        // Activate circle and Cycle 1 if circle has reached full capacity
        long newActiveMembers = groupMemberRepository.countByGroupIdAndStatus(request.getGroup().getId(), GroupMember.MemberStatus.ACTIVE);
        int targetMembers = (request.getGroup().getMemberCount() != null && request.getGroup().getMemberCount() > 0) 
                ? request.getGroup().getMemberCount() : 1;
        if (newActiveMembers >= targetMembers) {
            SeettuGroup group = request.getGroup();
            if (group.getStatus() != SeettuGroup.GroupStatus.ACTIVE) {
                group.setStatus(SeettuGroup.GroupStatus.ACTIVE);
                groupRepository.save(group);
            }
            List<com.seettu.manager.entity.PaymentCycle> cycles = cycleRepository.findByGroupIdOrderByCycleNumberAsc(group.getId());
            if (!cycles.isEmpty() && cycles.get(0).getStatus() == com.seettu.manager.entity.PaymentCycle.CycleStatus.PENDING) {
                // Recalibrate cycle schedules starting from today so all members get their full, proper collection duration
                java.time.LocalDate startDate = java.time.LocalDate.now();
                for (int i = 0; i < cycles.size(); i++) {
                    com.seettu.manager.entity.PaymentCycle c = cycles.get(i);
                    java.time.LocalDate endDate;
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
                    c.setStartDate(startDate);
                    c.setEndDate(endDate);
                    if (i == 0) {
                        c.setStatus(com.seettu.manager.entity.PaymentCycle.CycleStatus.ACTIVE);
                    } else {
                        c.setStatus(com.seettu.manager.entity.PaymentCycle.CycleStatus.PENDING);
                    }
                    cycleRepository.save(c);
                    startDate = endDate.plusDays(1);
                }

                List<GroupMember> allMembers = groupMemberRepository.findByGroupIdAndStatus(group.getId(), GroupMember.MemberStatus.ACTIVE);
                String fullNotice = "Circle Full Notice: '" + group.getName() + "' has officially reached full capacity (" 
                        + newActiveMembers + "/" + targetMembers + " members)! Rotational Cycle #1 is now ACTIVE and open for contributions.";
                for (GroupMember gm : allMembers) {
                    if (gm.getUser() != null && gm.getUser().getId() != null) {
                        try {
                            notificationService.sendNotification(gm.getUser().getId(), fullNotice, "GROUP_ACTIVATED");
                        } catch (Exception ignored) {}
                    }
                }
            }
        }

        return request;
    }

    @Transactional
    public JoinGroupRequest rejectRequest(Long requestId) {
        JoinGroupRequest request = joinGroupRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("JoinGroupRequest", "id", requestId));

        request.setStatus(JoinGroupRequest.RequestStatus.REJECTED);
        joinGroupRequestRepository.save(request);

        notificationService.sendNotification(
                request.getUser().getId(),
                "Your request to join group '" + request.getGroup().getName() + "' was rejected.",
                "JOIN_REJECTED"
        );

        return request;
    }
}
