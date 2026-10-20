USE seettu_manager;

-- 1. Ensure user Hamas Akram has ORGANIZER role and verified KYC
UPDATE users 
SET role = 'ORGANIZER', kyc_status = 'VERIFIED', nic_number = '200312345678'
WHERE email = 'hamasakram2003@gmail.com';

-- 2. Insert test demo users (Password: Password@123)
-- Hash: $2a$10$5l/sv5l3IDBEPGQ1t420MujHFWdWHCBhMkivBi7OCOFaV8vHopOZa
INSERT INTO users (full_name, email, phone, nic_number, kyc_status, password_hash, role, preferred_language, is_locked, failed_login_attempts)
VALUES 
('Reeha Hanan', 'reeha@gmail.com', '0771112233', '199512345678', 'VERIFIED', '$2a$10$5l/sv5l3IDBEPGQ1t420MujHFWdWHCBhMkivBi7OCOFaV8vHopOZa', 'ORGANIZER', 'EN', FALSE, 0),
('Jone Perera', 'jone@example.com', '0772223344', '199812345678', 'VERIFIED', '$2a$10$5l/sv5l3IDBEPGQ1t420MujHFWdWHCBhMkivBi7OCOFaV8vHopOZa', 'MEMBER', 'EN', FALSE, 0),
('Nethmi Silva', 'nethmi@example.com', '0773334455', '200112345678', 'VERIFIED', '$2a$10$5l/sv5l3IDBEPGQ1t420MujHFWdWHCBhMkivBi7OCOFaV8vHopOZa', 'MEMBER', 'EN', FALSE, 0),
('Asrar Mohamed', 'asrar@example.com', '0774445566', '200012345678', 'VERIFIED', '$2a$10$5l/sv5l3IDBEPGQ1t420MujHFWdWHCBhMkivBi7OCOFaV8vHopOZa', 'MEMBER', 'EN', FALSE, 0)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), role = VALUES(role), kyc_status = VALUES(kyc_status);

-- Get organizer ID (prefer Hamas Akram if exists, else Reeha)
SET @organizer_id = (SELECT id FROM users WHERE email = 'hamasakram2003@gmail.com' LIMIT 1);
SET @admin_id = (SELECT id FROM users WHERE email = 'admin@seetumanager.com' LIMIT 1);
SET @member_jone = (SELECT id FROM users WHERE email = 'jone@example.com' LIMIT 1);
SET @member_nethmi = (SELECT id FROM users WHERE email = 'nethmi@example.com' LIMIT 1);
SET @member_asrar = (SELECT id FROM users WHERE email = 'asrar@example.com' LIMIT 1);

-- 3. Insert Demo Groups
INSERT INTO seettu_groups (id, name, description, contribution_amount, member_count, cycle_frequency, status, seettu_type_id, category, created_by)
VALUES 
(1, "Village Women's Seettu", "Monthly savings pool for village self-help micro-entrepreneurs", 1000.00, 10, 'MONTHLY', 'ACTIVE', 1, 'GENERAL', @organizer_id),
(2, "Small Business Seettu", "Capital investment circle for local shopkeepers and traders", 5000.00, 8, 'MONTHLY', 'ACTIVE', 1, 'GENERAL', @organizer_id),
(3, "Community Farmer's Group", "Agricultural machinery & seasonal cultivation non-monetary asset pool", 2000.00, 12, 'MONTHLY', 'ACTIVE', 2, 'GOLD', @organizer_id)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), status = VALUES(status);

-- 4. Enroll Members into Groups
INSERT INTO group_members (group_id, user_id, status)
VALUES 
(1, @organizer_id, 'ACTIVE'),
(1, @member_jone, 'ACTIVE'),
(1, @member_nethmi, 'ACTIVE'),
(1, @member_asrar, 'ACTIVE'),
(2, @organizer_id, 'ACTIVE'),
(2, @member_jone, 'ACTIVE'),
(2, @member_nethmi, 'ACTIVE'),
(3, @organizer_id, 'ACTIVE'),
(3, @member_asrar, 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

-- 5. Insert Payment Cycles for Group 1
INSERT INTO payment_cycles (id, group_id, cycle_number, start_date, end_date, payout_member_id, status)
VALUES 
(1, 1, 1, '2026-09-01', '2026-09-30', @organizer_id, 'COMPLETED'),
(2, 1, 2, '2026-10-01', '2026-10-31', @member_jone, 'ACTIVE'),
(3, 1, 3, '2026-11-01', '2026-11-30', @member_nethmi, 'PENDING')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Insert Payment Cycles for Group 2
INSERT INTO payment_cycles (id, group_id, cycle_number, start_date, end_date, payout_member_id, status)
VALUES 
(4, 2, 1, '2026-10-01', '2026-10-31', @organizer_id, 'ACTIVE'),
(5, 2, 2, '2026-11-01', '2026-11-30', @member_jone, 'PENDING')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- 6. Insert Payments
-- Cycle 1 (Completed)
INSERT INTO payments (cycle_id, member_id, amount, status, payment_date, recorded_by, notes)
VALUES 
(1, @organizer_id, 1000.00, 'PAID', '2026-09-05', @organizer_id, 'On-time cash contribution'),
(1, @member_jone, 1000.00, 'PAID', '2026-09-06', @organizer_id, 'Bank slip verified'),
(1, @member_nethmi, 1000.00, 'PAID', '2026-09-10', @organizer_id, 'On-time payment'),
(1, @member_asrar, 1000.00, 'PAID', '2026-09-12', @organizer_id, 'Cash received')
ON DUPLICATE KEY UPDATE status = VALUES(status), payment_date = VALUES(payment_date);

-- Cycle 2 (Active Current Month)
INSERT INTO payments (cycle_id, member_id, amount, status, payment_date, recorded_by, notes)
VALUES 
(2, @organizer_id, 1000.00, 'PAID', '2026-10-05', @organizer_id, 'October installment paid'),
(2, @member_jone, 1000.00, 'PAID', '2026-10-08', @organizer_id, 'October installment verified'),
(2, @member_nethmi, 1000.00, 'PENDING', NULL, NULL, 'Awaiting bank deposit slip'),
(2, @member_asrar, 1000.00, 'LATE', NULL, NULL, 'Follow up sent for payment')
ON DUPLICATE KEY UPDATE status = VALUES(status);
