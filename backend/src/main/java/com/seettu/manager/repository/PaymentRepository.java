package com.seettu.manager.repository;

import com.seettu.manager.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCycleId(Long cycleId);
    List<Payment> findByMemberId(Long memberId);
    List<Payment> findByCycleIdAndStatus(Long cycleId, Payment.PaymentStatus status);
    Optional<Payment> findByCycleIdAndMemberId(Long cycleId, Long memberId);
    boolean existsByCycleIdAndMemberId(Long cycleId, Long memberId);
    List<Payment> findByStatus(Payment.PaymentStatus status);

    @Query("SELECT DISTINCT p FROM Payment p " +
           "LEFT JOIN FETCH p.cycle c " +
           "LEFT JOIN FETCH c.group " +
           "LEFT JOIN FETCH p.member " +
           "LEFT JOIN FETCH p.recordedBy " +
           "ORDER BY p.id DESC")
    List<Payment> findAllWithDetails();

    @Query("SELECT DISTINCT p FROM Payment p " +
           "LEFT JOIN FETCH p.cycle c " +
           "LEFT JOIN FETCH c.group " +
           "LEFT JOIN FETCH p.member " +
           "LEFT JOIN FETCH p.recordedBy " +
           "WHERE p.cycle.group.id = :groupId " +
           "ORDER BY p.id DESC")
    List<Payment> findByGroupIdWithDetails(@Param("groupId") Long groupId);

    @Query("SELECT DISTINCT p FROM Payment p " +
           "LEFT JOIN FETCH p.cycle c " +
           "LEFT JOIN FETCH c.group " +
           "LEFT JOIN FETCH p.member " +
           "LEFT JOIN FETCH p.recordedBy " +
           "WHERE p.member.id = :memberId " +
           "ORDER BY p.id DESC")
    List<Payment> findByMemberIdWithDetails(@Param("memberId") Long memberId);

    @Query("SELECT DISTINCT p FROM Payment p " +
           "LEFT JOIN FETCH p.cycle c " +
           "LEFT JOIN FETCH c.group " +
           "LEFT JOIN FETCH p.member " +
           "LEFT JOIN FETCH p.recordedBy " +
           "WHERE p.cycle.id = :cycleId " +
           "ORDER BY p.id DESC")
    List<Payment> findByCycleIdWithDetails(@Param("cycleId") Long cycleId);

    @Query("SELECT p FROM Payment p WHERE p.cycle.group.id = :groupId")
    List<Payment> findByGroupId(@Param("groupId") Long groupId);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.member.id = :memberId AND p.status = :status")
    long countByMemberIdAndStatus(@Param("memberId") Long memberId, @Param("status") Payment.PaymentStatus status);

    @Query("SELECT p FROM Payment p WHERE p.cycle.group.id = :groupId AND p.member.id = :memberId")
    List<Payment> findByGroupIdAndMemberId(@Param("groupId") Long groupId, @Param("memberId") Long memberId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.member.id = :userId AND p.status = :status")
    java.math.BigDecimal sumAmountByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Payment.PaymentStatus status);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.member.id = :userId AND p.status = :status")
    long countByMemberUserIdAndStatus(@Param("userId") Long userId, @Param("status") Payment.PaymentStatus status);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.member.id = :userId")
    long countAllByUserId(@Param("userId") Long userId);
}
