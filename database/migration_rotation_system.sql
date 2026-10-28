-- Migration: Spinning Wheel Rotation System
-- Adds rotation fields to payment_cycles and creates rotation_assignments table

ALTER TABLE payment_cycles 
ADD COLUMN max_payout_slots INT NULL,
ADD COLUMN rotation_status VARCHAR(50) NOT NULL DEFAULT 'PENDING';

CREATE TABLE IF NOT EXISTS rotation_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cycle_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    assigned_number INT NULL,
    spun_at DATETIME NULL,
    spin_result VARCHAR(50) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rotation_cycle FOREIGN KEY (cycle_id) REFERENCES payment_cycles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rotation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_cycle_user (cycle_id, user_id)
);
