package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.dto.RotationInitializeRequest;
import com.seettu.manager.dto.RotationStatusResponse;
import com.seettu.manager.dto.SpinResultResponse;
import com.seettu.manager.entity.User;
import com.seettu.manager.service.RotationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rotation")
@RequiredArgsConstructor
public class RotationController {

    private final RotationService rotationService;

    /**
     * Start the rotation wheel for a cycle.
     * Validates all payments are PAID, sets rotation_status = 'IN_PROGRESS',
     * and automatically assigns position #1 to Organizer.
     */
    @PostMapping("/{cycleId}/start")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RotationStatusResponse>> startRotation(
            @PathVariable Long cycleId) {
        RotationStatusResponse response = rotationService.startRotation(cycleId);
        return ResponseEntity.ok(ApiResponse.success("Spinning wheel rotation opened successfully", response));
    }

    /**
     * Backward-compatibility alias for initialize endpoint.
     */
    @PostMapping("/{cycleId}/initialize")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RotationStatusResponse>> initializeRotation(
            @PathVariable Long cycleId,
            @RequestBody(required = false) RotationInitializeRequest request,
            @AuthenticationPrincipal User currentUser) {
        Integer maxSlots = request != null ? request.getMaxPayoutSlots() : null;
        RotationStatusResponse response = rotationService.initializeRotation(cycleId, currentUser, maxSlots);
        return ResponseEntity.ok(ApiResponse.success("Spinning wheel rotation initialized successfully", response));
    }

    /**
     * Set payout slots limit for this month (e.g. 3).
     * Accepts { "limit": 3 } or query parameter "limit".
     */
    @PostMapping("/{cycleId}/limit")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RotationStatusResponse>> setPayoutLimit(
            @PathVariable Long cycleId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(required = false) Integer limit) {
        Integer resolvedLimit = limit;
        if (resolvedLimit == null && body != null) {
            if (body.containsKey("limit") && body.get("limit") != null) {
                resolvedLimit = Integer.parseInt(body.get("limit").toString());
            } else if (body.containsKey("maxPayoutSlots") && body.get("maxPayoutSlots") != null) {
                resolvedLimit = Integer.parseInt(body.get("maxPayoutSlots").toString());
            }
        }
        RotationStatusResponse response = rotationService.setPayoutLimit(cycleId, resolvedLimit);
        return ResponseEntity.ok(ApiResponse.success("Monthly payout slots limit set to " + resolvedLimit, response));
    }

    /**
     * Member spins the wheel.
     * Member only (Organizer cannot spin, position #1 is reserved).
     */
    @PostMapping("/{cycleId}/spin")
    public ResponseEntity<ApiResponse<SpinResultResponse>> spinWheel(
            @PathVariable Long cycleId,
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal User currentUser) {
        Long targetUserId = (currentUser != null) ? currentUser.getId() : null;
        if (body != null && body.containsKey("userId") && body.get("userId") != null) {
            targetUserId = Long.parseLong(body.get("userId").toString());
        }
        SpinResultResponse response = rotationService.spinWheel(cycleId, targetUserId);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    /**
     * Gets the full rotation status, wheel state, and member assignments for a cycle.
     */
    @GetMapping("/{cycleId}/status")
    public ResponseEntity<ApiResponse<RotationStatusResponse>> getRotationStatus(
            @PathVariable Long cycleId,
            @AuthenticationPrincipal User currentUser) {
        RotationStatusResponse response = rotationService.getRotationStatus(cycleId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Finalizes and completes the rotation for the cycle.
     * Organizer or Admin only. Locks all spins and updates cycle payout member.
     */
    @PostMapping("/{cycleId}/complete")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RotationStatusResponse>> completeRotation(
            @PathVariable Long cycleId) {
        RotationStatusResponse response = rotationService.completeRotation(cycleId);
        return ResponseEntity.ok(ApiResponse.success("Rotation finalized and locked successfully", response));
    }
}
