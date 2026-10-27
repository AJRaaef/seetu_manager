-- Migration: Member Verification & Supporting Documents
-- Database: seettu_manager

USE seettu_manager;

CREATE TABLE IF NOT EXISTS member_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    nic_number VARCHAR(20) NOT NULL,
    nic_front_image_path VARCHAR(500) NOT NULL,
    nic_back_image_path VARCHAR(500) NOT NULL,
    gn_certificate_image_path VARCHAR(500) NOT NULL,
    gn_division VARCHAR(100) NULL,
    gn_issue_date DATE NULL,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    verified_by BIGINT NULL,
    verified_at DATETIME NULL,
    rejection_reason TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_mv_verified_by FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_mv_user_id (user_id),
    INDEX idx_mv_status (verification_status),
    INDEX idx_mv_nic (nic_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS member_additional_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    verification_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(150) NOT NULL,
    document_image_path VARCHAR(500) NOT NULL,
    description TEXT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mad_verification FOREIGN KEY (verification_id) REFERENCES member_verifications(id) ON DELETE CASCADE,
    INDEX idx_mad_verification_id (verification_id),
    INDEX idx_mad_doc_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
