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
    private final com.seettu.manager.service.DisciplineScoreService disciplineScoreService;

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

    @GetMapping("/{id}/profile-picture")
    public ResponseEntity<?> getProfilePicture(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user.getProfilePictureUrl() != null && !user.getProfilePictureUrl().isBlank()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FOUND)
                    .location(java.net.URI.create(user.getProfilePictureUrl()))
                    .build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<ApiResponse<User>> uploadProfilePicture(
            @PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal User authUser) throws java.io.IOException {
        if (authUser != null && authUser.getRole() != User.Role.ADMIN && !authUser.getId().equals(id)) {
            throw new IllegalArgumentException("You are not authorized to update another user's profile picture.");
        }
        User updated = userService.uploadProfilePicture(id, file);
        return ResponseEntity.ok(ApiResponse.success("Profile picture updated successfully", updated));
    }

    @DeleteMapping("/{id}/profile-picture")
    public ResponseEntity<ApiResponse<User>> deleteProfilePicture(
            @PathVariable Long id,
            @AuthenticationPrincipal User authUser) {
        if (authUser != null && authUser.getRole() != User.Role.ADMIN && !authUser.getId().equals(id)) {
            throw new IllegalArgumentException("You are not authorized to remove another user's profile picture.");
        }
        User updated = userService.deleteProfilePicture(id);
        return ResponseEntity.ok(ApiResponse.success("Profile picture removed successfully", updated));
    }

    @PostMapping("/kyc/submit")
    public ResponseEntity<ApiResponse<com.seettu.manager.dto.UserKycResponse>> submitKyc(
            @RequestParam("nicNumber") String nicNumber,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "requestedRole", required = false) String requestedRole,
            @AuthenticationPrincipal User currentUser) throws java.io.IOException {
        com.seettu.manager.dto.UserKycResponse response = userService.submitKyc(currentUser.getId(), nicNumber, file, requestedRole);
        return ResponseEntity.ok(ApiResponse.success("Grama Niladhari certificate and NIC submitted successfully for verification", response));
    }

    @GetMapping("/kyc/status")
    public ResponseEntity<ApiResponse<com.seettu.manager.dto.UserKycResponse>> getMyKycStatus(
            @AuthenticationPrincipal User currentUser) {
        User user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(userService.toKycResponse(user)));
    }

    @GetMapping("/kyc/pending")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<List<com.seettu.manager.dto.UserKycResponse>>> getPendingKyc() {
        return ResponseEntity.ok(ApiResponse.success(userService.getPendingKycUsers()));
    }

    @GetMapping("/kyc/members")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<List<com.seettu.manager.dto.UserKycResponse>>> getAllMembersKyc() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllMembersWithKyc()));
    }

    @PutMapping("/{id}/kyc/verify")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<com.seettu.manager.dto.UserKycResponse>> verifyMemberKyc(
            @PathVariable Long id,
            @RequestBody com.seettu.manager.dto.KycVerificationRequest request,
            @AuthenticationPrincipal User admin) {
        com.seettu.manager.dto.UserKycResponse response = userService.verifyKyc(id, request, admin);
        String msg = "VERIFIED".equalsIgnoreCase(request.getStatus()) ? "Member verified successfully" : "Member verification rejected";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }

    @PostMapping("/request-organizer")
    public ResponseEntity<ApiResponse<String>> requestOrganizerRole(
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal User currentUser) {
        userService.requestOrganizerRole(currentUser.getId(), payload != null ? payload : Collections.emptyMap());
        return ResponseEntity.ok(ApiResponse.success("Your request to become an Organizer has been submitted for administrative verification.", "SUCCESS"));
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

        // Average Discipline Score based on unified scoring engine
        com.seettu.manager.dto.ScoreResponse scoreDetail = disciplineScoreService.calculateScore(id);
        int disciplineScore = (int) Math.round(scoreDetail.getScore());

        // Certificates count
        List<Certificate> certs = certificateRepository.findByUserId(id);
        int certificatesCount = certs != null ? certs.size() : 0;

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("user", user);
        responseData.put("totalContributed", totalContributed);
        responseData.put("groupsParticipated", groupsParticipated);
        responseData.put("averageDisciplineScore", disciplineScore);
        responseData.put("disciplineCategory", scoreDetail.getCategory());
        responseData.put("certificatesEarned", certificatesCount);
        responseData.put("groups", joinedGroups != null ? joinedGroups : Collections.emptyList());

        return ResponseEntity.ok(ApiResponse.success(responseData));
    }
}
