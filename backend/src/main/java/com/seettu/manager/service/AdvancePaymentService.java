package com.seettu.manager.service;

import com.seettu.manager.entity.AdvancePayment;
import com.seettu.manager.entity.User;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.AdvancePaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdvancePaymentService {

    private final AdvancePaymentRepository advancePaymentRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;

    @Transactional
    public AdvancePayment recordAdvancePayment(Long memberId, BigDecimal amount, String notes) {
        User member = userService.getUserById(memberId);
        AdvancePayment payment = AdvancePayment.builder()
                .member(member)
                .amount(amount)
                .paymentDate(LocalDate.now())
                .notes(notes)
                .build();
        payment = advancePaymentRepository.save(payment);

        auditLogService.log(member, "ADVANCE_PAYMENT_RECORDED", "advance_payments", payment.getId(),
                "Advance payment of " + amount + " recorded for: " + member.getFullName());

        return payment;
    }

    @Transactional(readOnly = true)
    public List<AdvancePayment> getByMember(Long memberId) {
        return advancePaymentRepository.findByMemberId(memberId);
    }

    @Transactional(readOnly = true)
    public AdvancePayment getById(Long id) {
        return advancePaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AdvancePayment", "id", id));
    }

    @Transactional(readOnly = true)
    public List<AdvancePayment> getAll() {
        return advancePaymentRepository.findAllWithMember();
    }

    @Transactional
    public AdvancePayment updateAdvancePayment(Long id, BigDecimal amount, String notes) {
        AdvancePayment payment = getById(id);
        if (amount != null) payment.setAmount(amount);
        if (notes != null) payment.setNotes(notes);
        payment = advancePaymentRepository.save(payment);

        auditLogService.log(payment.getMember(), "ADVANCE_PAYMENT_UPDATED", "advance_payments", payment.getId(),
                "Advance payment updated: " + payment.getAmount() + " LKR");

        return payment;
    }

    @Transactional
    public void deleteAdvancePayment(Long id) {
        AdvancePayment payment = getById(id);
        advancePaymentRepository.delete(payment);

        auditLogService.log(payment.getMember(), "ADVANCE_PAYMENT_DELETED", "advance_payments", id,
                "Advance payment #" + id + " deleted");
    }
}
