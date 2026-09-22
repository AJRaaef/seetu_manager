package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.dto.PaymentRecordRequest;
import com.seettu.manager.dto.PaymentResponse;
import com.seettu.manager.entity.Payment;
import com.seettu.manager.entity.User;
import com.seettu.manager.service.PaymentService;
import com.seettu.manager.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> recordPayment(
            @Valid @RequestBody PaymentRecordRequest request,
            @RequestParam(required = false) Long recorderId,
            @AuthenticationPrincipal User authUser) {
        Long finalRecorderId = (recorderId != null) ? recorderId : (authUser != null ? authUser.getId() : null);
        if (finalRecorderId == null) {
            throw new IllegalArgumentException("Recorder ID is required");
        }
        User recorder = userService.getUserById(finalRecorderId);
        Payment payment = paymentService.recordPayment(request, recorder);
        return ResponseEntity.ok(ApiResponse.success("Payment recorded successfully", paymentService.toPaymentResponse(payment)));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByGroup(@PathVariable Long groupId) {
        List<Payment> payments = paymentService.getPaymentsByGroup(groupId);
        return ResponseEntity.ok(ApiResponse.success(paymentService.toPaymentResponseList(payments)));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByMember(@PathVariable Long memberId) {
        List<Payment> payments = paymentService.getPaymentsByMember(memberId);
        return ResponseEntity.ok(ApiResponse.success(paymentService.toPaymentResponseList(payments)));
    }
    
    @GetMapping("/cycle/{cycleId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByCycle(@PathVariable Long cycleId) {
        List<Payment> payments = paymentService.getPaymentsByCycle(cycleId);
        return ResponseEntity.ok(ApiResponse.success(paymentService.toPaymentResponseList(payments)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success(paymentService.toPaymentResponseList(payments)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> updatePayment(@PathVariable Long id,
                                                                      @RequestBody PaymentRecordRequest request) {
        Payment payment = paymentService.updatePayment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Payment updated successfully", paymentService.toPaymentResponse(payment)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.success("Payment deleted successfully", null));
    }
}
