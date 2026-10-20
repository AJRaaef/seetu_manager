package com.seettu.manager.repository;

import com.seettu.manager.entity.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    @Query("SELECT d FROM Dispute d LEFT JOIN FETCH d.group LEFT JOIN FETCH d.raisedBy LEFT JOIN FETCH d.resolvedBy ORDER BY d.id DESC")
    List<Dispute> findAllWithDetails();

    @Query("SELECT d FROM Dispute d LEFT JOIN FETCH d.group LEFT JOIN FETCH d.raisedBy LEFT JOIN FETCH d.resolvedBy WHERE d.group.id = :groupId ORDER BY d.id DESC")
    List<Dispute> findByGroupIdWithDetails(@Param("groupId") Long groupId);

    @Query("SELECT d FROM Dispute d LEFT JOIN FETCH d.group LEFT JOIN FETCH d.raisedBy LEFT JOIN FETCH d.resolvedBy WHERE d.raisedBy.id = :userId ORDER BY d.id DESC")
    List<Dispute> findByRaisedByIdWithDetails(@Param("userId") Long userId);

    List<Dispute> findByGroupId(Long groupId);
    List<Dispute> findByRaisedById(Long userId);
    List<Dispute> findByStatus(Dispute.DisputeStatus status);
    List<Dispute> findByGroupIdAndStatus(Long groupId, Dispute.DisputeStatus status);
    long countByStatus(Dispute.DisputeStatus status);
}
