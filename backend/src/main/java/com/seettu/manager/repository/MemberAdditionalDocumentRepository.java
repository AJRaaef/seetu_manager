package com.seettu.manager.repository;

import com.seettu.manager.entity.MemberAdditionalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberAdditionalDocumentRepository extends JpaRepository<MemberAdditionalDocument, Long> {

    List<MemberAdditionalDocument> findByVerificationIdOrderByUploadedAtDesc(Long verificationId);

    Optional<MemberAdditionalDocument> findByIdAndVerificationId(Long id, Long verificationId);
}
