package com.seettu.manager.repository;

import com.seettu.manager.entity.PaymentCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentCycleRepository extends JpaRepository<PaymentCycle, Long> {
    @Query("SELECT c FROM PaymentCycle c LEFT JOIN FETCH c.payoutMember WHERE c.group.id = :groupId ORDER BY c.cycleNumber ASC")
    List<PaymentCycle> findByGroupIdOrderByCycleNumberAsc(@Param("groupId") Long groupId);

    @Query("SELECT c FROM PaymentCycle c WHERE c.group.id = :groupId AND c.status = :status")
    List<PaymentCycle> findByGroupIdAndStatus(@Param("groupId") Long groupId, @Param("status") PaymentCycle.CycleStatus status);

    @Query("SELECT c FROM PaymentCycle c WHERE c.group.id = :groupId AND c.cycleNumber = :cycleNumber")
    Optional<PaymentCycle> findByGroupIdAndCycleNumber(@Param("groupId") Long groupId, @Param("cycleNumber") Integer cycleNumber);

    List<PaymentCycle> findByStatus(PaymentCycle.CycleStatus status);
    List<PaymentCycle> findByEndDateBeforeAndStatus(LocalDate date, PaymentCycle.CycleStatus status);
}
