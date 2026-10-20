package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.dto.DisputeRequest;
import com.seettu.manager.entity.Dispute;
import com.seettu.manager.entity.User;
import com.seettu.manager.service.DisputeService;
import com.seettu.manager.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Dispute>>> getAllDisputes() {
        return ResponseEntity.ok(ApiResponse.success(disputeService.getAllDisputes()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Dispute>> createDispute(@Valid @RequestBody DisputeRequest request, 
                                                              @RequestParam(required = false) Long raisedById,
                                                              @AuthenticationPrincipal User authUser) {
        Long userId = raisedById != null ? raisedById : (authUser != null ? authUser.getId() : null);
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required to raise a dispute");
        }
        User raisedBy = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("Dispute raised successfully", disputeService.createDispute(request, raisedBy)));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<ApiResponse<List<Dispute>>> getDisputesByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(ApiResponse.success(disputeService.getDisputesByGroup(groupId)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Dispute>>> getDisputesByRaisedBy(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(disputeService.getDisputesByRaisedBy(userId)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<Dispute>> updateStatus(@PathVariable Long id, 
                                                             @RequestParam String status,
                                                             @RequestParam(required = false) String resolutionNotes,
                                                             @RequestParam(required = false) Long resolvedById,
                                                             @AuthenticationPrincipal User authUser) {
        Long resolverId = resolvedById != null ? resolvedById : (authUser != null ? authUser.getId() : null);
        User resolvedBy = resolverId != null ? userService.getUserById(resolverId) : authUser;
        return ResponseEntity.ok(ApiResponse.success("Dispute status updated", 
                disputeService.updateDisputeStatus(id, status, resolutionNotes, resolvedBy)));
    }
}
