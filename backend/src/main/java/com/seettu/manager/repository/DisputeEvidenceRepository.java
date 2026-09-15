package com.seettu.manager.repository;

import com.seettu.manager.entity.DisputeEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeEvidenceRepository extends JpaRepository<DisputeEvidence, Long> {
    List<DisputeEvidence> findByDisputeId(Long disputeId);
}
