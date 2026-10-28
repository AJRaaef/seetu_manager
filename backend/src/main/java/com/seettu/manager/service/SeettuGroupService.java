package com.seettu.manager.service;

import com.seettu.manager.dto.GroupCreateRequest;
import com.seettu.manager.dto.GroupResponse;
import com.seettu.manager.entity.*;
import com.seettu.manager.exception.DuplicateResourceException;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeettuGroupService {

    private final SeettuGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final SeettuTypeRepository typeRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final PaymentCycleService paymentCycleService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;
    private final DisciplineScoreService disciplineScoreService;
    private final PaymentRepository paymentRepository;
    private final PaymentCycleRepository cycleRepository;

    @Transactional(readOnly = true)
    public SeettuGroup getGroupById(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", id));
    }

    @Transactional(readOnly = true)
    public List<SeettuGroup> getAllGroups() {
        return groupRepository.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    public List<SeettuGroup> getGroupsByUser(Long userId) {
        return groupRepository.findGroupsByMemberId(userId);
    }

    @Transactional(readOnly = true)
    public List<SeettuGroup> getGroupsByCreator(Long userId) {
        return groupRepository.findByCreatedById(userId);
    }

    @Transactional(readOnly = true)
    public List<SeettuGroup> getJoinedGroupsByMember(Long userId) {
        return groupRepository.findJoinedGroupsByMemberId(userId);
    }

    @Transactional(readOnly = true)
    public List<SeettuGroup> searchGroups(String keyword) {
        return groupRepository.searchByKeyword(keyword);
    }

    @Transactional
    public SeettuGroup createGroup(GroupCreateRequest request, User creator) {
        // Only non-organizers and non-admins require explicit verification before creating groups
        if (creator != null && creator.getRole() == User.Role.MEMBER) {
            if (creator.getKycStatus() != User.KycStatus.VERIFIED) {
                throw new IllegalArgumentException("Verification Required: You must verify your Sri Lankan NIC and submit a Grama Niladhari Character Certificate before creating a Seettu group.");
            }
        }

        SeettuGroup.CycleFrequency cycleFrequency = SeettuGroup.CycleFrequency.MONTHLY;
        if (request.getCycleFrequency() != null && !request.getCycleFrequency().trim().isEmpty()) {
            try {
                cycleFrequency = SeettuGroup.CycleFrequency.valueOf(request.getCycleFrequency().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                cycleFrequency = SeettuGroup.CycleFrequency.MONTHLY;
            }
        }

        SeettuGroup group = SeettuGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .contributionAmount(request.getContributionAmount())
                .memberCount(request.getMemberCount())
                .cycleFrequency(cycleFrequency)
                .status((request.getMemberCount() != null && request.getMemberCount() <= 1) ? SeettuGroup.GroupStatus.ACTIVE : SeettuGroup.GroupStatus.PENDING)
                .category(request.getCategory())
                .createdBy(creator)
                .build();

        if (request.getSeettuTypeId() != null) {
            SeettuType type = typeRepository.findById(request.getSeettuTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("SeettuType", "id", request.getSeettuTypeId()));
            group.setSeettuType(type);
        }

        if (request.getShopId() != null) {
            Shop shop = shopRepository.findById(request.getShopId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shop", "id", request.getShopId()));
            group.setShop(shop);
        }

        group = groupRepository.save(group);

        // Add creator as first member ONLY if creator is NOT a System Admin
        if (creator != null && creator.getRole() != User.Role.ADMIN) {
            GroupMember creatorMember = GroupMember.builder()
                    .group(group)
                    .user(creator)
                    .status(GroupMember.MemberStatus.ACTIVE)
                    .build();
            memberRepository.save(creatorMember);
        }

        // Generate payment cycles automatically
        paymentCycleService.generateCycles(group);

        auditLogService.log(creator, "GROUP_CREATED", "seettu_groups", group.getId(),
                "Group created: " + group.getName());

        return group;
    }

    @Transactional
    public SeettuGroup updateGroup(Long id, GroupCreateRequest request) {
        SeettuGroup group = getGroupById(id);
        if (request.getName() != null) group.setName(request.getName());
        if (request.getDescription() != null) group.setDescription(request.getDescription());
        if (request.getContributionAmount() != null) group.setContributionAmount(request.getContributionAmount());
        if (request.getCategory() != null) group.setCategory(request.getCategory());
        return groupRepository.save(group);
    }

    @Transactional
    public void deleteGroup(Long id) {
        SeettuGroup group = getGroupById(id);
        groupRepository.delete(group);
    }

    @Transactional
    public GroupMember addMember(Long groupId, Long userId) {
        SeettuGroup group = getGroupById(groupId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() == User.Role.ADMIN) {
            throw new IllegalArgumentException("System Admins cannot participate in Seettu group contribution cycles");
        }

        if (user.getRole() == User.Role.MEMBER && user.getKycStatus() != User.KycStatus.VERIFIED) {
            throw new IllegalStateException("Identity Verification Required: Member '" + user.getFullName() + 
                    "' must submit their NIC number and Grama Niladhari Character Certificate for System Admin verification before joining a Seettu group to prevent duplicate accounts, risk, and fraud.");
        }

        if (memberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new DuplicateResourceException("User is already a member of this group");
        }

        long activeMembers = memberRepository.countByGroupIdAndStatus(groupId, GroupMember.MemberStatus.ACTIVE);
        if (activeMembers >= group.getMemberCount()) {
            throw new IllegalArgumentException("Group has reached maximum member count");
        }

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(user)
                .status(GroupMember.MemberStatus.ACTIVE)
                .build();
        member = memberRepository.save(member);

        notificationService.sendNotification(userId, "You have been added to group: " + group.getName(), "GROUP");
        auditLogService.log(user, "MEMBER_ADDED", "group_members", member.getId(),
                "Member added to group: " + group.getName());

        return member;
    }

    @Transactional
    public GroupMember inviteOrAddMember(Long groupId, String fullName, String email, String phone) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required to invite or add a member");
        }
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .fullName(fullName != null && !fullName.isBlank() ? fullName : email.split("@")[0])
                    .email(email)
                    .phone(phone != null && !phone.isBlank() ? phone : "0770000000")
                    .passwordHash(passwordEncoder.encode("Seettu@123"))
                    .role(User.Role.MEMBER)
                    .preferredLanguage(User.Language.EN)
                    .isLocked(false)
                    .failedLoginAttempts(0)
                    .build();
            return userRepository.save(newUser);
        });

        return addMember(groupId, user.getId());
    }

    @Transactional
    public void removeMember(Long groupId, Long userId) {
        GroupMember member = memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this group"));
        member.setStatus(GroupMember.MemberStatus.REMOVED);
        memberRepository.save(member);

        SeettuGroup group = getGroupById(groupId);
        notificationService.sendNotification(userId, "You have been removed from group: " + group.getName(), "GROUP");
    }

    @Transactional
    public List<GroupMember> getGroupMembers(Long groupId) {
        SeettuGroup group = getGroupById(groupId);
        if (group != null && group.getCreatedBy() != null) {
            boolean creatorPresent = memberRepository.existsByGroupIdAndUserId(groupId, group.getCreatedBy().getId());
            if (!creatorPresent) {
                GroupMember creatorMember = GroupMember.builder()
                        .group(group)
                        .user(group.getCreatedBy())
                        .status(GroupMember.MemberStatus.ACTIVE)
                        .build();
                memberRepository.save(creatorMember);
            }
        }
        List<GroupMember> members = memberRepository.findByGroupIdAndStatus(groupId, GroupMember.MemberStatus.ACTIVE);
        attachDisciplineScores(members);
        return members;
    }

    @Transactional(readOnly = true)
    public List<GroupMember> getAllActiveMembers() {
        List<GroupMember> members = memberRepository.findAllActiveWithDetails().stream()
                .filter(member -> member.getUser() != null && member.getUser().getRole() != User.Role.ADMIN)
                .collect(Collectors.toList());
        attachDisciplineScores(members);
        return members;
    }

    private void attachDisciplineScores(List<GroupMember> members) {
        if (members == null || members.isEmpty()) return;
        for (GroupMember gm : members) {
            if (gm.getUser() != null) {
                try {
                    com.seettu.manager.dto.ScoreResponse score = disciplineScoreService.calculateScore(gm.getUser().getId());
                    gm.setDisciplineScore(score.getScore());
                    gm.setDisciplineCategory(score.getCategory());
                } catch (Exception e) {
                    gm.setDisciplineScore(100.0);
                    gm.setDisciplineCategory("EXCELLENT");
                }
            }
        }
    }

    @Transactional
    public GroupResponse toGroupResponse(SeettuGroup group) {
        List<GroupMember> members = memberRepository.findByGroupIdAndStatus(group.getId(), GroupMember.MemberStatus.ACTIVE);
        List<PaymentCycle> cycles = paymentCycleService.getCyclesByGroup(group.getId());
        List<Payment> groupPayments = paymentRepository.findByGroupId(group.getId());
        int activeMemberCount = members.size();
        int targetMemberCount = (group.getMemberCount() != null && group.getMemberCount() > 0) ? group.getMemberCount() : 1;
        boolean isGroupFull = activeMemberCount >= targetMemberCount;

        // Auto-sync group status: ACTIVE if full, PENDING if still forming
        if (group.getStatus() != SeettuGroup.GroupStatus.COMPLETED && group.getStatus() != SeettuGroup.GroupStatus.CANCELLED) {
            if (isGroupFull && group.getStatus() != SeettuGroup.GroupStatus.ACTIVE) {
                group.setStatus(SeettuGroup.GroupStatus.ACTIVE);
                groupRepository.save(group);
            } else if (!isGroupFull && group.getStatus() == SeettuGroup.GroupStatus.ACTIVE) {
                group.setStatus(SeettuGroup.GroupStatus.PENDING);
                groupRepository.save(group);
            }
        }

        long completedCyclesCount = 0;

        for (PaymentCycle c : cycles) {
            long paidMembers = groupPayments.stream()
                    .filter(p -> p.getCycle() != null && p.getCycle().getId().equals(c.getId()))
                    .filter(p -> p.getStatus() == Payment.PaymentStatus.PAID || p.getStatus() == Payment.PaymentStatus.LATE)
                    .map(p -> p.getMember() != null ? p.getMember().getId() : null)
                    .filter(java.util.Objects::nonNull)
                    .distinct()
                    .count();

            // Self-healing: If cycle was falsely marked COMPLETED before circle was full or before all members paid, revert it
            if (c.getStatus() == PaymentCycle.CycleStatus.COMPLETED && (!isGroupFull || paidMembers < targetMemberCount)) {
                c.setStatus(isGroupFull && c.getCycleNumber() == 1 ? PaymentCycle.CycleStatus.ACTIVE : PaymentCycle.CycleStatus.PENDING);
                cycleRepository.save(c);
            }

            // A cycle is legitimately complete ONLY if the circle is full AND all members have paid
            boolean isCyclePaid = (isGroupFull && paidMembers >= targetMemberCount);
            if (c.getStatus() == PaymentCycle.CycleStatus.COMPLETED) {
                completedCyclesCount++;
            } else if (isCyclePaid) {
                completedCyclesCount++;
                paymentCycleService.updateCycleStatus(c.getId(), "COMPLETED");
            }
        }

        // Ensure cycles adhere to circle status:
        if (!isGroupFull) {
            // Circle not full yet: all cycles must be PENDING
            for (PaymentCycle c : cycles) {
                if (c.getStatus() == PaymentCycle.CycleStatus.ACTIVE) {
                    c.setStatus(PaymentCycle.CycleStatus.PENDING);
                    cycleRepository.save(c);
                }
            }
        } else {
            // Circle is full: exactly the earliest incomplete cycle must be ACTIVE
            boolean activeFound = false;
            for (PaymentCycle c : cycles) {
                if (c.getStatus() == PaymentCycle.CycleStatus.COMPLETED) continue;
                if (!activeFound) {
                    if (c.getStatus() != PaymentCycle.CycleStatus.ACTIVE) {
                        c.setStatus(PaymentCycle.CycleStatus.ACTIVE);
                        cycleRepository.save(c);
                    }
                    activeFound = true;
                } else {
                    if (c.getStatus() == PaymentCycle.CycleStatus.ACTIVE) {
                        c.setStatus(PaymentCycle.CycleStatus.PENDING);
                        cycleRepository.save(c);
                    }
                }
            }
        }

        int totalCycles = cycles.isEmpty() ? (group.getMemberCount() != null ? group.getMemberCount() : 1) : cycles.size();
        if (completedCyclesCount >= totalCycles && group.getStatus() != SeettuGroup.GroupStatus.COMPLETED) {
            group.setStatus(SeettuGroup.GroupStatus.COMPLETED);
            groupRepository.save(group);
        }

        double completionRate = (group.getStatus() == SeettuGroup.GroupStatus.COMPLETED || completedCyclesCount >= totalCycles)
                ? 100.0
                : (totalCycles > 0 ? Math.min(100.0, Math.round(((double) completedCyclesCount / totalCycles) * 100.0)) : 0.0);

        String createdByName = group.getCreatedBy() != null ? group.getCreatedBy().getFullName() : "System";
        Long createdById = group.getCreatedBy() != null ? group.getCreatedBy().getId() : null;

        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .contributionAmount(group.getContributionAmount())
                .memberCount(group.getMemberCount())
                .cycleFrequency(group.getCycleFrequency().name())
                .status(group.getStatus().name())
                .seettuTypeName(group.getSeettuType() != null ? group.getSeettuType().getName() : null)
                .category(group.getCategory())
                .shopId(group.getShop() != null ? group.getShop().getId() : null)
                .shopName(group.getShop() != null ? group.getShop().getName() : null)
                .shopAddress(group.getShop() != null ? group.getShop().getAddress() : null)
                .createdByName(createdByName)
                .createdById(createdById)
                .createdAt(group.getCreatedAt())
                .completedCycles((int) completedCyclesCount)
                .completionRate(completionRate)
                .members(members.stream().map(m -> GroupResponse.MemberInfo.builder()
                        .id(m.getId())
                        .userId(m.getUser().getId())
                        .fullName(m.getUser().getFullName())
                        .email(m.getUser().getEmail())
                        .phone(m.getUser().getPhone())
                        .nicNumber(m.getUser().getNicNumber())
                        .role(m.getUser().getRole() != null ? m.getUser().getRole().name() : "MEMBER")
                        .status(m.getStatus().name())
                        .build()).collect(Collectors.toList()))
                .cycles(cycles.stream().map(c -> {
                    long paidMembers = groupPayments.stream()
                            .filter(p -> p.getCycle() != null && p.getCycle().getId().equals(c.getId()))
                            .filter(p -> p.getStatus() == Payment.PaymentStatus.PAID || p.getStatus() == Payment.PaymentStatus.LATE)
                            .map(p -> p.getMember() != null ? p.getMember().getId() : null)
                            .filter(java.util.Objects::nonNull)
                            .distinct()
                            .count();
                    boolean isFullyPaid = (activeMemberCount > 0 && paidMembers >= activeMemberCount)
                            || c.getStatus() == PaymentCycle.CycleStatus.COMPLETED;

                    Long payoutMemberId = c.getPayoutMember() != null ? c.getPayoutMember().getId() : null;
                    String payoutMemberName = c.getPayoutMember() != null ? c.getPayoutMember().getFullName() : null;
                    if (payoutMemberName == null) {
                        if (c.getCycleNumber() == 1) {
                            if (group.getCreatedBy() != null) {
                                payoutMemberId = group.getCreatedBy().getId();
                                payoutMemberName = group.getCreatedBy().getFullName();
                            } else if (activeMemberCount > 0 && members.get(0).getUser() != null) {
                                payoutMemberId = members.get(0).getUser().getId();
                                payoutMemberName = members.get(0).getUser().getFullName();
                            }
                        } else if (activeMemberCount > 0) {
                            Long organizerId = group.getCreatedBy() != null ? group.getCreatedBy().getId() : null;
                            List<GroupMember> otherMembers = members.stream()
                                    .filter(m -> m.getUser() != null && (organizerId == null || !m.getUser().getId().equals(organizerId)))
                                    .toList();
                            if (!otherMembers.isEmpty()) {
                                int idx = (c.getCycleNumber() - 2) % otherMembers.size();
                                payoutMemberId = otherMembers.get(idx).getUser().getId();
                                payoutMemberName = otherMembers.get(idx).getUser().getFullName();
                            } else {
                                int idx = (c.getCycleNumber() - 1) % activeMemberCount;
                                if (members.get(idx).getUser() != null) {
                                    payoutMemberId = members.get(idx).getUser().getId();
                                    payoutMemberName = members.get(idx).getUser().getFullName();
                                }
                            }
                        }
                    }
                    if (payoutMemberName == null) {
                        payoutMemberName = "Unassigned";
                    }

                    return GroupResponse.CycleInfo.builder()
                            .id(c.getId())
                            .cycleNumber(c.getCycleNumber())
                            .startDate(c.getStartDate().toString())
                            .endDate(c.getEndDate().toString())
                            .payoutMemberId(payoutMemberId)
                            .payoutMemberName(payoutMemberName)
                            .status(c.getStatus() != null ? c.getStatus().name() : "PENDING")
                            .paidCount(paidMembers)
                            .isFullyPaid(isFullyPaid)
                            .build();
                }).collect(Collectors.toList()))
                .build();
    }
}