package com.seettu.manager.repository;

import com.seettu.manager.entity.PaymentCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentCycleRepository extends JpaRepository<PaymentCycle, Long> {
    List<PaymentCycle> findByGroupIdOrderByCycleNumberAsc(Long groupId);
    List<PaymentCycle> findByGroupIdAndStatus(Long groupId, PaymentCycle.CycleStatus status);
    Optional<PaymentCycle> findByGroupIdAndCycleNumber(Long groupId, Integer cycleNumber);
    List<PaymentCycle> findByStatus(PaymentCycle.CycleStatus status);
    List<PaymentCycle> findByEndDateBeforeAndStatus(LocalDate date, PaymentCycle.CycleStatus status);
}
