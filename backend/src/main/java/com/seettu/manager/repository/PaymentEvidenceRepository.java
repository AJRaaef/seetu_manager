package com.seettu.manager.repository;

import com.seettu.manager.entity.PaymentEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentEvidenceRepository extends JpaRepository<PaymentEvidence, Long> {
    List<PaymentEvidence> findByPaymentId(Long paymentId);
}
