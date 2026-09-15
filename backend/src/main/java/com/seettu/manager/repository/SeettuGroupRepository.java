package com.seettu.manager.repository;

import com.seettu.manager.entity.SeettuGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeettuGroupRepository extends JpaRepository<SeettuGroup, Long> {
    List<SeettuGroup> findByCreatedById(Long userId);
    List<SeettuGroup> findByStatus(SeettuGroup.GroupStatus status);
    List<SeettuGroup> findByShopId(Long shopId);
    List<SeettuGroup> findBySeettuTypeId(Long typeId);

    @Query("SELECT g FROM SeettuGroup g WHERE g.name LIKE %:keyword% OR g.description LIKE %:keyword%")
    List<SeettuGroup> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT g FROM SeettuGroup g LEFT JOIN GroupMember gm ON gm.group.id = g.id WHERE g.createdBy.id = :userId OR (gm.user.id = :userId AND gm.status = 'ACTIVE')")
    List<SeettuGroup> findGroupsByMemberId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT g FROM SeettuGroup g JOIN GroupMember gm ON gm.group.id = g.id WHERE gm.user.id = :userId AND gm.status = 'ACTIVE'")
    List<SeettuGroup> findJoinedGroupsByMemberId(@Param("userId") Long userId);

    long countByStatus(SeettuGroup.GroupStatus status);
}
