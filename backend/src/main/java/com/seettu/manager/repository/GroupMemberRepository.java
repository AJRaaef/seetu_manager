package com.seettu.manager.repository;

import com.seettu.manager.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    @Query("SELECT gm FROM GroupMember gm LEFT JOIN FETCH gm.user WHERE gm.group.id = :groupId")
    List<GroupMember> findByGroupId(@Param("groupId") Long groupId);

    @Query("SELECT gm FROM GroupMember gm WHERE gm.user.id = :userId")
    List<GroupMember> findByUserId(@Param("userId") Long userId);

    @Query("SELECT gm FROM GroupMember gm LEFT JOIN FETCH gm.user WHERE gm.group.id = :groupId AND gm.status = :status")
    List<GroupMember> findByGroupIdAndStatus(@Param("groupId") Long groupId, @Param("status") GroupMember.MemberStatus status);

    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.user.id = :userId")
    Optional<GroupMember> findByGroupIdAndUserId(@Param("groupId") Long groupId, @Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(gm) > 0 THEN TRUE ELSE FALSE END FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.user.id = :userId")
    boolean existsByGroupIdAndUserId(@Param("groupId") Long groupId, @Param("userId") Long userId);

    @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.status = :status")
    long countByGroupIdAndStatus(@Param("groupId") Long groupId, @Param("status") GroupMember.MemberStatus status);

    @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.status = :status")
    long countByStatus(@Param("status") GroupMember.MemberStatus status);

    @Query("SELECT DISTINCT gm FROM GroupMember gm LEFT JOIN FETCH gm.user LEFT JOIN FETCH gm.group WHERE gm.status = 'ACTIVE' ORDER BY gm.id DESC")
    List<GroupMember> findAllActiveWithDetails();
}
