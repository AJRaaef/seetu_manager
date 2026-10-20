package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.entity.PaymentCycle;
import com.seettu.manager.entity.User;
import com.seettu.manager.service.PaymentCycleService;
import com.seettu.manager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-cycles")
@RequiredArgsConstructor
public class PaymentCycleController {

    private final PaymentCycleService paymentCycleService;
    private final UserService userService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<ApiResponse<List<PaymentCycle>>> getCyclesByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(ApiResponse.success(paymentCycleService.getCyclesByGroup(groupId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentCycle>> getCycleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(paymentCycleService.getCycleById(id)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<PaymentCycle>> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Cycle status updated", paymentCycleService.updateCycleStatus(id, status)));
    }

    @PutMapping("/{id}/payout-member")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<PaymentCycle>> assignPayoutMember(@PathVariable Long id, @RequestParam Long memberId) {
        User member = userService.getUserById(memberId);
        return ResponseEntity.ok(ApiResponse.success("Payout member assigned", paymentCycleService.assignPayoutMember(id, member)));
    }
}
