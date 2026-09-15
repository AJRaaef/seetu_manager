package com.seettu.manager.repository;

import com.seettu.manager.entity.EmergencyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, Long> {
    List<EmergencyRequest> findByGroupId(Long groupId);
    List<EmergencyRequest> findByRaisedById(Long userId);
    List<EmergencyRequest> findByStatus(EmergencyRequest.EmergencyStatus status);
    long countByStatus(EmergencyRequest.EmergencyStatus status);
}
