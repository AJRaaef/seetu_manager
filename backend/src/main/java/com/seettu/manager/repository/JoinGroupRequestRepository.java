package com.seettu.manager.repository;

import com.seettu.manager.entity.JoinGroupRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JoinGroupRequestRepository extends JpaRepository<JoinGroupRequest, Long> {
    List<JoinGroupRequest> findByGroupId(Long groupId);
    List<JoinGroupRequest> findByUserId(Long userId);
    List<JoinGroupRequest> findByGroupIdAndStatus(Long groupId, JoinGroupRequest.RequestStatus status);
    Optional<JoinGroupRequest> findByGroupIdAndUserId(Long groupId, Long userId);
    boolean existsByGroupIdAndUserIdAndStatus(Long groupId, Long userId, JoinGroupRequest.RequestStatus status);
}
