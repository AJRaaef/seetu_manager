package com.seettu.manager.repository;

import com.seettu.manager.entity.SeettuGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeettuGroupRepository extends JpaRepository<SeettuGroup, Long> {

    @Query("SELECT DISTINCT g FROM SeettuGroup g " +
           "LEFT JOIN FETCH g.createdBy " +
           "LEFT JOIN FETCH g.seettuType " +
           "LEFT JOIN FETCH g.shop")
    List<SeettuGroup> findAllWithDetails();

    @Query("SELECT g FROM SeettuGroup g " +
           "JOIN FETCH g.createdBy " +
           "LEFT JOIN FETCH g.seettuType " +
           "WHERE g.createdBy.id = :userId")
    List<SeettuGroup> findByCreatedById(@Param("userId") Long userId);

    List<SeettuGroup> findByStatus(SeettuGroup.GroupStatus status);

    @Query("SELECT g FROM SeettuGroup g " +
           "JOIN FETCH g.createdBy " +
           "LEFT JOIN FETCH g.seettuType " +
           "WHERE g.shop.id = :shopId")
    List<SeettuGroup> findByShopId(@Param("shopId") Long shopId);

    @Query("SELECT g FROM SeettuGroup g " +
           "JOIN FETCH g.createdBy " +
           "LEFT JOIN FETCH g.seettuType " +
           "WHERE g.seettuType.id = :typeId")
    List<SeettuGroup> findBySeettuTypeId(@Param("typeId") Long typeId);

    @Query("SELECT g FROM SeettuGroup g " +
           "JOIN FETCH g.createdBy " +
           "LEFT JOIN FETCH g.seettuType " +
           "WHERE g.name LIKE %:keyword% OR g.description LIKE %:keyword%")
    List<SeettuGroup> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT g FROM SeettuGroup g " +
           "JOIN FETCH g.createdBy " +
           "LEFT JOIN FETCH g.seettuType " +
           "LEFT JOIN GroupMember gm ON gm.group.id = g.id " +
           "WHERE g.createdBy.id = :userId OR (gm.user.id = :userId AND gm.status = 'ACTIVE')")
    List<SeettuGroup> findGroupsByMemberId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT g FROM SeettuGroup g " +
           "JOIN FETCH g.createdBy " +
           "LEFT JOIN FETCH g.seettuType " +
           "JOIN GroupMember gm ON gm.group.id = g.id " +
           "WHERE gm.user.id = :userId AND gm.status = 'ACTIVE'")
    List<SeettuGroup> findJoinedGroupsByMemberId(@Param("userId") Long userId);

    long countByStatus(SeettuGroup.GroupStatus status);
}