package com.seettu.manager.repository;

import com.seettu.manager.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByGeneratedById(Long userId);
    List<Report> findByType(String type);
}
