package com.seettu.manager.repository;

import com.seettu.manager.entity.AdvancePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdvancePaymentRepository extends JpaRepository<AdvancePayment, Long> {
    @Query("SELECT ap FROM AdvancePayment ap LEFT JOIN FETCH ap.member WHERE ap.member.id = :memberId ORDER BY ap.id DESC")
    List<AdvancePayment> findByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT ap FROM AdvancePayment ap LEFT JOIN FETCH ap.member ORDER BY ap.id DESC")
    List<AdvancePayment> findAllWithMember();
}
