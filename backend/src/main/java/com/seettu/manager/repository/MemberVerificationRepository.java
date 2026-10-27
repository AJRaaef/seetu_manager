package com.seettu.manager.repository;

import com.seettu.manager.entity.MemberVerification;
import com.seettu.manager.entity.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberVerificationRepository extends JpaRepository<MemberVerification, Long> {

    Optional<MemberVerification> findByUserId(Long userId);

    Optional<MemberVerification> findByNicNumber(String nicNumber);

    boolean existsByUserId(Long userId);

    boolean existsByNicNumberAndUserIdNot(String nicNumber, Long userId);

    List<MemberVerification> findByVerificationStatusOrderByCreatedAtDesc(VerificationStatus verificationStatus);

    List<MemberVerification> findAllByOrderByCreatedAtDesc();

    long countByVerificationStatus(VerificationStatus verificationStatus);

    @Query("SELECT mv FROM MemberVerification mv JOIN mv.user u " +
           "WHERE (:status IS NULL OR mv.verificationStatus = :status) " +
           "AND (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(mv.nicNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR u.phone LIKE CONCAT('%', :search, '%')) " +
           "ORDER BY mv.createdAt DESC")
    List<MemberVerification> searchVerifications(@Param("status") @org.springframework.lang.Nullable VerificationStatus status,
                                                  @Param("search") @org.springframework.lang.Nullable String search);
}
