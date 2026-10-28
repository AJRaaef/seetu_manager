package com.seettu.manager.repository;

import com.seettu.manager.entity.RotationAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RotationAssignmentRepository extends JpaRepository<RotationAssignment, Long> {

    @Query("SELECT ra FROM RotationAssignment ra " +
           "LEFT JOIN FETCH ra.user " +
           "LEFT JOIN FETCH ra.cycle " +
           "WHERE ra.cycle.id = :cycleId " +
           "ORDER BY CASE WHEN ra.assignedNumber IS NULL THEN 9999 ELSE ra.assignedNumber END ASC, ra.id ASC")
    List<RotationAssignment> findByCycleIdWithUser(@Param("cycleId") Long cycleId);

    List<RotationAssignment> findByCycleId(Long cycleId);

    Optional<RotationAssignment> findByCycleIdAndUserId(Long cycleId, Long userId);

    boolean existsByCycleIdAndUserId(Long cycleId, Long userId);

    @Modifying
    @Query("DELETE FROM RotationAssignment ra WHERE ra.cycle.id = :cycleId")
    void deleteByCycleId(@Param("cycleId") Long cycleId);
}
