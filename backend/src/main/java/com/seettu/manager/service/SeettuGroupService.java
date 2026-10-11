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
        SeettuGroup group = SeettuGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .contributionAmount(request.getContributionAmount())
                .memberCount(request.getMemberCount())
                .cycleFrequency(SeettuGroup.CycleFrequency.valueOf(request.getCycleFrequency()))
                .status(SeettuGroup.GroupStatus.ACTIVE)
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

    @Transactional(readOnly = true)
    public List<GroupMember> getGroupMembers(Long groupId) {
        return memberRepository.findByGroupIdAndStatus(groupId, GroupMember.MemberStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public List<GroupMember> getAllActiveMembers() {
        return memberRepository.findAllActiveWithDetails().stream()
                .filter(member -> member.getUser() != null && member.getUser().getRole() != User.Role.ADMIN)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroupResponse toGroupResponse(SeettuGroup group) {
        List<GroupMember> members = memberRepository.findByGroupIdAndStatus(group.getId(), GroupMember.MemberStatus.ACTIVE);
        List<PaymentCycle> cycles = paymentCycleService.getCyclesByGroup(group.getId());

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
                .shopName(group.getShop() != null ? group.getShop().getName() : null)
                .createdByName(createdByName)
                .createdById(createdById)
                .createdAt(group.getCreatedAt())
                .members(members.stream().map(m -> GroupResponse.MemberInfo.builder()
                        .id(m.getId())
                        .userId(m.getUser().getId())
                        .fullName(m.getUser().getFullName())
                        .email(m.getUser().getEmail())
                        .status(m.getStatus().name())
                        .build()).collect(Collectors.toList()))
                .cycles(cycles.stream().map(c -> GroupResponse.CycleInfo.builder()
                        .id(c.getId())
                        .cycleNumber(c.getCycleNumber())
                        .startDate(c.getStartDate().toString())
                        .endDate(c.getEndDate().toString())
                        .payoutMemberName(c.getPayoutMember() != null ? c.getPayoutMember().getFullName() : "Unassigned")
                        .status(c.getStatus().name())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}