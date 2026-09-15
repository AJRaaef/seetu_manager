package com.seettu.manager.repository;

import com.seettu.manager.entity.SeettuType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SeettuTypeRepository extends JpaRepository<SeettuType, Long> {
    Optional<SeettuType> findByName(String name);
    boolean existsByName(String name);
}
