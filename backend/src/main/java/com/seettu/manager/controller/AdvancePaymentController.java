package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.entity.AdvancePayment;
import com.seettu.manager.entity.User;
import com.seettu.manager.service.AdvancePaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/advance-payments")
@RequiredArgsConstructor
public class AdvancePaymentController {

    private final AdvancePaymentService advancePaymentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<AdvancePayment>> recordAdvancePayment(
            @RequestParam(required = false) Long memberId,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) Long groupId,
            @AuthenticationPrincipal User authUser) {
        Long finalMemberId = (memberId != null) ? memberId : (authUser != null ? authUser.getId() : null);
        if (finalMemberId == null) {
            throw new IllegalArgumentException("Member ID is required");
        }
        return ResponseEntity.ok(ApiResponse.success("Advance payment recorded successfully", 
                advancePaymentService.recordAdvancePayment(finalMemberId, amount, notes)));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<ApiResponse<List<AdvancePayment>>> getByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(ApiResponse.success(advancePaymentService.getByMember(memberId)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AdvancePayment>>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(advancePaymentService.getByMember(userId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdvancePayment>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(advancePaymentService.getAll()));
    }
}
