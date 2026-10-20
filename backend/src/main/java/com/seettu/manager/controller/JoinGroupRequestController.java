package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.entity.JoinGroupRequest;
import com.seettu.manager.entity.User;
import com.seettu.manager.service.JoinGroupRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/join-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class JoinGroupRequestController {

    private final JoinGroupRequestService joinGroupRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<JoinGroupRequest>> createJoinRequest(
            @RequestParam Long groupId,
            @RequestParam(required = false) Long userId,
            @AuthenticationPrincipal User authUser) {
        Long targetUserId = userId != null ? userId : (authUser != null ? authUser.getId() : null);
        if (targetUserId == null) {
            throw new IllegalArgumentException("User ID is required to submit a join request.");
        }
        JoinGroupRequest request = joinGroupRequestService.createJoinRequest(groupId, targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Join request submitted successfully", request));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<JoinGroupRequest>>> getPendingRequests() {
        List<JoinGroupRequest> pending = joinGroupRequestService.getPendingRequests();
        return ResponseEntity.ok(ApiResponse.success(pending));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<JoinGroupRequest>>> getRequestsByUser(@PathVariable Long userId) {
        List<JoinGroupRequest> requests = joinGroupRequestService.getRequestsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<JoinGroupRequest>> approveRequest(@PathVariable Long id) {
        JoinGroupRequest approved = joinGroupRequestService.approveRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Join request approved successfully", approved));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<ApiResponse<JoinGroupRequest>> rejectRequest(@PathVariable Long id) {
        JoinGroupRequest rejected = joinGroupRequestService.rejectRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Join request rejected", rejected));
    }
}
