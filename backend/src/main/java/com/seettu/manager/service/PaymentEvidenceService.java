package com.seettu.manager.service;

import com.seettu.manager.entity.Payment;
import com.seettu.manager.entity.PaymentEvidence;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.PaymentEvidenceRepository;
import com.seettu.manager.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentEvidenceService {

    private final PaymentEvidenceRepository paymentEvidenceRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public PaymentEvidence addEvidence(Long paymentId, String filePath) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
        
        PaymentEvidence evidence = PaymentEvidence.builder()
                .payment(payment)
                .filePath(filePath)
                .build();
        
        return paymentEvidenceRepository.save(evidence);
    }

    @Transactional(readOnly = true)
    public List<PaymentEvidence> getEvidencesByPayment(Long paymentId) {
        return paymentEvidenceRepository.findByPaymentId(paymentId);
    }
}
