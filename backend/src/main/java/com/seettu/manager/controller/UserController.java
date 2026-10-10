package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.entity.Certificate;
import com.seettu.manager.entity.GroupMember;
import com.seettu.manager.entity.SeettuGroup;
import com.seettu.manager.entity.User;
import com.seettu.manager.repository.CertificateRepository;
import com.seettu.manager.repository.GroupMemberRepository;
import com.seettu.manager.repository.PaymentRepository;
import com.seettu.manager.repository.SeettuGroupRepository;
import com.seettu.manager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final SeettuGroupRepository groupRepository;
    private final PaymentRepository paymentRepository;
    private final CertificateRepository certificateRepository;
    private final GroupMemberRepository groupMemberRepository;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable Long id,
                                                        @RequestBody Map<String, String> request) {
        String fullName = request.get("fullName");
        String phone = request.get("phone");
        String preferredLanguage = request.get("preferredLanguage");
        User updated = userService.updateUser(id, fullName, phone, preferredLanguage);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserProfileStats(@PathVariable Long id) {
        User user = userService.getUserById(id);

        // Admin oversight: Admins do not participate in contribution circles or hold discipline ratings
        if (user.getRole() == User.Role.ADMIN) {
            Map<String, Object> adminData = new HashMap<>();
            adminData.put("user", user);
            adminData.put("isAdmin", true);
            adminData.put("role", "ADMIN");
            adminData.put("totalContributed", BigDecimal.ZERO);
            adminData.put("groupsParticipated", 0);
            adminData.put("averageDisciplineScore", null);
            adminData.put("certificatesEarned", 0);
            adminData.put("groups", Collections.emptyList());
            return ResponseEntity.ok(ApiResponse.success(adminData));
        }

        // Calculate total contributed by user across all groups
        BigDecimal totalContributed = paymentRepository.sumAmountByUserIdAndStatus(id, com.seettu.manager.entity.Payment.PaymentStatus.PAID);
        if (totalContributed == null) {
            totalContributed = BigDecimal.ZERO;
        }

        // Get groups participated by this user
        List<SeettuGroup> joinedGroups = groupRepository.findGroupsByMemberId(id);
        int groupsParticipated = joinedGroups != null ? joinedGroups.size() : 0;

        // If creator/organizer, also include groups created
        if (user.getRole() == User.Role.ORGANIZER || user.getRole() == User.Role.ADMIN) {
            List<SeettuGroup> createdGroups = groupRepository.findByCreatedById(id);
            if (createdGroups != null) {
                Set<Long> uniqueGroupIds = new HashSet<>();
                if (joinedGroups != null) {
                    for (SeettuGroup g : joinedGroups) uniqueGroupIds.add(g.getId());
                }
                for (SeettuGroup g : createdGroups) {
                    if (uniqueGroupIds.add(g.getId())) {
                        if (joinedGroups == null) joinedGroups = new ArrayList<>();
                        joinedGroups.add(g);
                    }
                }
                groupsParticipated = uniqueGroupIds.size();
            }
        }

        // Average Discipline Score based on payments on time
        long paidCount = paymentRepository.countByMemberUserIdAndStatus(id, com.seettu.manager.entity.Payment.PaymentStatus.PAID);
        long totalPaymentCount = paymentRepository.countAllByUserId(id);
        int disciplineScore = 100;
        if (totalPaymentCount > 0) {
            disciplineScore = (int) Math.round(((double) paidCount / totalPaymentCount) * 100.0);
            if (disciplineScore < 50) disciplineScore = 50;
        }

        // Certificates count
        List<Certificate> certs = certificateRepository.findByUserId(id);
        int certificatesCount = certs != null ? certs.size() : 0;

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("user", user);
        responseData.put("totalContributed", totalContributed);
        responseData.put("groupsParticipated", groupsParticipated);
        responseData.put("averageDisciplineScore", disciplineScore);
        responseData.put("certificatesEarned", certificatesCount);
        responseData.put("groups", joinedGroups != null ? joinedGroups : Collections.emptyList());

        return ResponseEntity.ok(ApiResponse.success(responseData));
    }
}
