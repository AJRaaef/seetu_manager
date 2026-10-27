package com.seettu.manager.repository;

import com.seettu.manager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByNicNumber(String nicNumber);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByNicNumber(String nicNumber);
    List<User> findByRole(User.Role role);
    List<User> findByIsLockedTrue();
    List<User> findByKycStatusOrderByCreatedAtDesc(User.KycStatus kycStatus);
    List<User> findByRequestedRole(String requestedRole);
}
