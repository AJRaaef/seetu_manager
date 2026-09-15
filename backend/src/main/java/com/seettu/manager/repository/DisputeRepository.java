package com.seettu.manager.repository;

import com.seettu.manager.entity.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    List<Dispute> findByGroupId(Long groupId);
    List<Dispute> findByRaisedById(Long userId);
    List<Dispute> findByStatus(Dispute.DisputeStatus status);
    List<Dispute> findByGroupIdAndStatus(Long groupId, Dispute.DisputeStatus status);
    long countByStatus(Dispute.DisputeStatus status);
}
