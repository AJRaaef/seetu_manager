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

    @Transactional
    public JoinGroupRequest createJoinRequest(Long groupId, Long userId) {
        SeettuGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("SeettuGroup", "id", groupId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new IllegalArgumentException("You are already an active member of this group. Duplicate membership is prohibited.");
        }

        if (user.getRole() == User.Role.MEMBER && user.getKycStatus() != User.KycStatus.VERIFIED) {
            throw new IllegalStateException("Identity Verification Required: You must submit your NIC and Grama Niladhari Character Certificate in your Profile and receive System Admin verification before requesting to join a Seettu group.");
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
