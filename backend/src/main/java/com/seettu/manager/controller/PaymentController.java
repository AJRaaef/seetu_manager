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
    private final com.seettu.manager.service.PaymentEvidenceService paymentEvidenceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER') or hasRole('MEMBER')")
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

    @PostMapping(value = "/{id}/evidence", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<com.seettu.manager.entity.PaymentEvidence>> uploadEvidenceMultipart(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "filePath", required = false) String filePath) throws java.io.IOException {
        if (file != null && !file.isEmpty()) {
            com.seettu.manager.entity.PaymentEvidence evidence = paymentEvidenceService.saveEvidenceFile(id, file);
            return ResponseEntity.ok(ApiResponse.success("Payment evidence attached successfully", evidence));
        }
        String path = (filePath != null && !filePath.trim().isEmpty()) ? filePath : "/uploads/payments/bank_slip_payment_" + id + ".png";
        com.seettu.manager.entity.PaymentEvidence evidence = paymentEvidenceService.addEvidence(id, path);
        return ResponseEntity.ok(ApiResponse.success("Payment evidence attached successfully", evidence));
    }

    @PostMapping(value = "/{id}/evidence")
    public ResponseEntity<ApiResponse<com.seettu.manager.entity.PaymentEvidence>> uploadEvidenceJson(
            @PathVariable Long id,
            @RequestParam(required = false) String filePath,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String path = (body != null && body.get("filePath") != null) ? body.get("filePath") : filePath;
        if (path == null || path.trim().isEmpty()) {
            path = "/uploads/payments/bank_slip_payment_" + id + ".png";
        }
        com.seettu.manager.entity.PaymentEvidence evidence = paymentEvidenceService.addEvidence(id, path);
        return ResponseEntity.ok(ApiResponse.success("Payment evidence attached successfully", evidence));
    }

    @GetMapping("/{id}/evidence")
    public ResponseEntity<ApiResponse<List<com.seettu.manager.entity.PaymentEvidence>>> getEvidences(@PathVariable Long id) {
        List<com.seettu.manager.entity.PaymentEvidence> evidences = paymentEvidenceService.getEvidencesByPayment(id);
        return ResponseEntity.ok(ApiResponse.success(evidences));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> updatePayment(
            @PathVariable Long id,
            @RequestBody PaymentRecordRequest request,
            @RequestParam(required = false) Long recorderId,
            @AuthenticationPrincipal User authUser) {
        Long finalRecorderId = (recorderId != null) ? recorderId : (authUser != null ? authUser.getId() : null);
        User recorder = (finalRecorderId != null) ? userService.getUserById(finalRecorderId) : null;
        Payment payment = paymentService.updatePayment(id, request, recorder);
        return ResponseEntity.ok(ApiResponse.success("Payment updated successfully", paymentService.toPaymentResponse(payment)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.success("Payment deleted successfully", null));
    }

    @PostMapping("/send-reminders")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<String>> triggerPaymentReminders() {
        int count = paymentService.sendPaymentReminders();
        return ResponseEntity.ok(ApiResponse.success("Payment reminders dispatched successfully", "Reminders sent: " + count));
    }
}
