-- SeettuManager Database Schema
-- Database: seettu_manager
-- All 18 tables with proper foreign keys, indexes, and constraints

CREATE DATABASE IF NOT EXISTS seettu_manager;
USE seettu_manager;

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    nic_number VARCHAR(20) NULL UNIQUE,
    gn_certificate_url VARCHAR(500) NULL,
    kyc_status ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'UNVERIFIED',
    kyc_rejection_reason TEXT NULL,
    verified_by BIGINT NULL,
    verified_at TIMESTAMP NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'ORGANIZER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    preferred_language ENUM('EN', 'SI', 'TA') NOT NULL DEFAULT 'EN',
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_nic (nic_number),
    INDEX idx_users_kyc_status (kyc_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. shops
-- ============================================================
CREATE TABLE shops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    owner_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_shops_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. seettu_types
-- ============================================================
CREATE TABLE seettu_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. seettu_groups
-- ============================================================
CREATE TABLE seettu_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    contribution_amount DECIMAL(12,2) NOT NULL,
    member_count INT NOT NULL,
    cycle_frequency ENUM('WEEKLY', 'BI_WEEKLY', 'MONTHLY') NOT NULL DEFAULT 'MONTHLY',
    status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'PENDING') NOT NULL DEFAULT 'PENDING',
    seettu_type_id BIGINT,
    category VARCHAR(50),
    shop_id BIGINT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seettu_type_id) REFERENCES seettu_types(id) ON DELETE SET NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_groups_status (status),
    INDEX idx_groups_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. group_members
-- ============================================================
CREATE TABLE group_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status ENUM('ACTIVE', 'REMOVED', 'LEFT') NOT NULL DEFAULT 'ACTIVE',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES seettu_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_group_member (group_id, user_id),
    INDEX idx_gm_group (group_id),
    INDEX idx_gm_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. payment_cycles
-- ============================================================
CREATE TABLE payment_cycles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    cycle_number INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payout_member_id BIGINT,
    status ENUM('PENDING', 'ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    FOREIGN KEY (group_id) REFERENCES seettu_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (payout_member_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_group_cycle (group_id, cycle_number),
    INDEX idx_pc_group (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. payments
-- ============================================================
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cycle_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status ENUM('PAID', 'PENDING', 'LATE', 'OVERDUE', 'MISSED', 'PARTIAL') NOT NULL DEFAULT 'PENDING',
    payment_date DATE,
    recorded_by BIGINT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cycle_id) REFERENCES payment_cycles(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_cycle_member (cycle_id, member_id),
    INDEX idx_payments_cycle (cycle_id),
    INDEX idx_payments_member (member_id),
    INDEX idx_payments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. advance_payments
-- ============================================================
CREATE TABLE advance_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    notes TEXT,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ap_member (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. payment_evidences
-- ============================================================
CREATE TABLE payment_evidences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_pe_payment (payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. join_group_requests
-- ============================================================
CREATE TABLE join_group_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES seettu_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_join_request (group_id, user_id),
    INDEX idx_jr_group (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. disputes
-- ============================================================
CREATE TABLE disputes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    raised_by_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'ESCALATED') NOT NULL DEFAULT 'OPEN',
    resolution_notes TEXT,
    resolved_by_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES seettu_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (raised_by_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_disputes_group (group_id),
    INDEX idx_disputes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. dispute_evidences
-- ============================================================
CREATE TABLE dispute_evidences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dispute_id BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
    INDEX idx_de_dispute (dispute_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. emergency_requests
-- ============================================================
CREATE TABLE emergency_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    raised_by_id BIGINT NOT NULL,
    requested_amount DECIMAL(12,2) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    resolution_notes TEXT,
    resolved_by_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES seettu_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (raised_by_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_er_group (group_id),
    INDEX idx_er_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. reports
-- ============================================================
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500),
    generated_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reports_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. notifications
-- ============================================================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. certificates
-- ============================================================
CREATE TABLE certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    certificate_uuid VARCHAR(36) NOT NULL UNIQUE,
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES seettu_groups(id) ON DELETE CASCADE,
    INDEX idx_cert_user (user_id),
    INDEX idx_cert_uuid (certificate_uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 17. audit_logs
-- ============================================================
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id BIGINT,
    details TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 18. faqs
-- ============================================================
CREATE TABLE faqs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    INDEX idx_faqs_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
