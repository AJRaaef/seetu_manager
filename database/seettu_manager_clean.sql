-- phpMyAdmin SQL Dump
-- Database: `seettu_manager`
-- Clean production database with ONLY original Admin account and system master data (Types & FAQs)
-- All demo users, test groups, demo verifications and test transactions removed.

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Recreate database
DROP DATABASE IF EXISTS `seettu_manager`;
CREATE DATABASE `seettu_manager` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `seettu_manager`;

-- --------------------------------------------------------

--
-- Table structure for table `advance_payments`
--

CREATE TABLE `advance_payments` (
  `id` bigint(20) NOT NULL,
  `member_id` bigint(20) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_date` date NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `target_table` varchar(50) DEFAULT NULL,
  `target_id` bigint(20) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `target_table`, `target_id`, `details`, `timestamp`) VALUES
(1, 1, 'SYSTEM_INIT', 'users', 1, 'System initialized with Admin: admin@seetumanager.com', '2026-10-19 06:12:55');

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `certificate_uuid` varchar(36) NOT NULL,
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `disputes`
--

CREATE TABLE `disputes` (
  `id` bigint(20) NOT NULL,
  `group_id` bigint(20) DEFAULT NULL,
  `raised_by_id` bigint(20) NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `status` enum('OPEN','UNDER_REVIEW','RESOLVED','REJECTED','ESCALATED') NOT NULL DEFAULT 'OPEN',
  `resolution_notes` text DEFAULT NULL,
  `resolved_by_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dispute_evidences`
--

CREATE TABLE `dispute_evidences` (
  `id` bigint(20) NOT NULL,
  `dispute_id` bigint(20) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `emergency_requests`
--

CREATE TABLE `emergency_requests` (
  `id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `raised_by_id` bigint(20) NOT NULL,
  `requested_amount` decimal(12,2) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `resolution_notes` text DEFAULT NULL,
  `resolved_by_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` bigint(20) NOT NULL,
  `question` varchar(500) NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`id`, `question`, `answer`, `category`) VALUES
(1, 'How to record a payment?', 'Go to Payments page, select the group and member, then click Record Payment. Fill in the amount and any notes, then submit.', 'Payments'),
(2, 'What is discipline score?', 'The discipline score is calculated based on your payment timeliness. Formula: 100 - [(LatePayments × 5) + (MissedPayments × 10) + (AvgDelayDays × 0.5)]. Categories: EXCELLENT (90-100), GOOD (75-89), FAIR (50-74), POOR (25-49), HIGH_RISK (0-24).', 'Scores'),
(3, 'How to join a group?', 'Go to the Groups page, find the group you want to join and click \"Request to Join\". The group organizer will review and approve your request.', 'Groups'),
(4, 'How to create a Seettu group?', 'Navigate to Groups page and click \"Create Group\". Fill in the group name, description, contribution amount, member count, cycle frequency, and type. Once created, members can request to join.', 'Groups'),
(5, 'What happens if I miss a payment?', 'Missing a payment negatively impacts your discipline score. The system marks it as MISSED and deducts 10 points from your score. The organizer will be notified.', 'Payments'),
(6, 'How does the payout schedule work?', 'When a group is created, the system automatically generates payment cycles. Each cycle, one member receives the total pot. The payout order is determined by the organizer.', 'Groups'),
(7, 'How to raise a dispute?', 'Go to the Disputes page and click \"Raise Dispute\". Select the group, choose the dispute type, and provide a description. You can also attach evidence files.', 'Disputes'),
(8, 'What is an emergency request?', 'If you face a financial emergency, you can request an early payout from your group. Go to Emergency page, select the group, enter the amount and reason. The organizer will review your request.', 'Emergency'),
(9, 'How to download my certificate?', 'After completing a Seettu cycle, go to the Certificates page. You can view and download your completion certificate as a PDF.', 'Certificates'),
(10, 'How to change my language?', 'Click the language switcher in the top navigation bar. You can choose between English, Sinhala (සිංහල), and Tamil (தமிழ்).', 'General');

-- --------------------------------------------------------

--
-- Table structure for table `group_members`
--

CREATE TABLE `group_members` (
  `id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `status` enum('ACTIVE','REMOVED','LEFT') NOT NULL DEFAULT 'ACTIVE',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `join_group_requests`
--

CREATE TABLE `join_group_requests` (
  `id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member_additional_documents`
--

CREATE TABLE `member_additional_documents` (
  `id` bigint(20) NOT NULL,
  `verification_id` bigint(20) NOT NULL,
  `document_type` varchar(50) NOT NULL,
  `document_name` varchar(150) NOT NULL,
  `document_image_path` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member_verifications`
--

CREATE TABLE `member_verifications` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `nic_number` varchar(20) NOT NULL,
  `nic_front_image_path` varchar(500) NOT NULL,
  `nic_back_image_path` varchar(500) NOT NULL,
  `gn_certificate_image_path` varchar(500) NOT NULL,
  `gn_division` varchar(100) DEFAULT NULL,
  `gn_issue_date` date DEFAULT NULL,
  `verification_status` enum('PENDING','VERIFIED','REJECTED','INCOMPLETE') NOT NULL,
  `verified_by` bigint(20) DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) NOT NULL,
  `cycle_id` bigint(20) NOT NULL,
  `member_id` bigint(20) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('PAID','PENDING','LATE','OVERDUE','MISSED','PARTIAL') NOT NULL DEFAULT 'PENDING',
  `payment_date` date DEFAULT NULL,
  `recorded_by` bigint(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_method` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_cycles`
--

CREATE TABLE `payment_cycles` (
  `id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `cycle_number` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `payout_member_id` bigint(20) DEFAULT NULL,
  `status` enum('PENDING','ACTIVE','COMPLETED') NOT NULL DEFAULT 'PENDING'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_evidences`
--

CREATE TABLE `payment_evidences` (
  `id` bigint(20) NOT NULL,
  `payment_id` bigint(20) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` bigint(20) NOT NULL,
  `title` varchar(200) NOT NULL,
  `type` varchar(50) NOT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `generated_by` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seettu_groups`
--

CREATE TABLE `seettu_groups` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `contribution_amount` decimal(12,2) NOT NULL,
  `member_count` int(11) NOT NULL,
  `cycle_frequency` enum('DAILY','WEEKLY','BI_WEEKLY','MONTHLY') NOT NULL DEFAULT 'MONTHLY',
  `status` enum('ACTIVE','COMPLETED','CANCELLED','PENDING') NOT NULL DEFAULT 'PENDING',
  `seettu_type_id` bigint(20) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `shop_id` bigint(20) DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seettu_types`
--

CREATE TABLE `seettu_types` (
  `id` bigint(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `seettu_types`
--

INSERT INTO `seettu_types` (`id`, `name`, `description`) VALUES
(1, 'Monetary', 'Traditional cash-based Seettu where members contribute money'),
(2, 'Non-Monetary', 'Item-based Seettu for goods and services');

-- --------------------------------------------------------

--
-- Table structure for table `shops`
--

CREATE TABLE `shops` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `owner_id` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `shop_address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `shop_name` varchar(150) NOT NULL,
  `shop_email` varchar(150) DEFAULT NULL,
  `shop_owner_name` varchar(150) DEFAULT NULL,
  `shop_register_number` varchar(100) DEFAULT NULL,
  `shop_type` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `nic_number` varchar(20) DEFAULT NULL,
  `gn_certificate_url` varchar(500) DEFAULT NULL,
  `profile_picture_url` varchar(500) DEFAULT NULL,
  `kyc_status` enum('UNVERIFIED','PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'UNVERIFIED',
  `kyc_rejection_reason` text DEFAULT NULL,
  `verified_by` bigint(20) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','ORGANIZER','MEMBER') NOT NULL DEFAULT 'MEMBER',
  `preferred_language` enum('EN','SI','TA') NOT NULL DEFAULT 'EN',
  `is_locked` tinyint(1) NOT NULL DEFAULT 0,
  `failed_login_attempts` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `address` varchar(255) DEFAULT NULL,
  `district` varchar(50) DEFAULT NULL,
  `organizer_application_note` text DEFAULT NULL,
  `requested_role` varchar(20) DEFAULT NULL,
  `locked_until` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users` (Original Admin Account Only)
--

INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `nic_number`, `gn_certificate_url`, `profile_picture_url`, `kyc_status`, `kyc_rejection_reason`, `verified_by`, `verified_at`, `password_hash`, `role`, `preferred_language`, `is_locked`, `failed_login_attempts`, `created_at`, `address`, `district`, `organizer_application_note`, `requested_role`, `locked_until`) VALUES
(1, 'System Admin', 'admin@seetumanager.com', '0712345678', '200008304373', NULL, NULL, 'VERIFIED', NULL, 1, '2026-10-23 13:28:15', '$2a$10$kd1JJkcQmTRCCJwpihNoYeKcV.Hv/RIapDLIXyatldG.bAtELCLVW', 'ADMIN', 'EN', 0, 0, '2026-10-19 06:12:55', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

-- Indexes for dumped tables
--

--
-- Indexes for table `advance_payments`
--
ALTER TABLE `advance_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ap_member` (`member_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_user` (`user_id`),
  ADD KEY `idx_audit_action` (`action`),
  ADD KEY `idx_audit_timestamp` (`timestamp`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `certificate_uuid` (`certificate_uuid`),
  ADD KEY `group_id` (`group_id`),
  ADD KEY `idx_cert_user` (`user_id`),
  ADD KEY `idx_cert_uuid` (`certificate_uuid`);

--
-- Indexes for table `disputes`
--
ALTER TABLE `disputes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `raised_by_id` (`raised_by_id`),
  ADD KEY `resolved_by_id` (`resolved_by_id`),
  ADD KEY `idx_disputes_group` (`group_id`),
  ADD KEY `idx_disputes_status` (`status`);

--
-- Indexes for table `dispute_evidences`
--
ALTER TABLE `dispute_evidences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_de_dispute` (`dispute_id`);

--
-- Indexes for table `emergency_requests`
--
ALTER TABLE `emergency_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `raised_by_id` (`raised_by_id`),
  ADD KEY `resolved_by_id` (`resolved_by_id`),
  ADD KEY `idx_er_group` (`group_id`),
  ADD KEY `idx_er_status` (`status`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_faqs_category` (`category`);

--
-- Indexes for table `group_members`
--
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_group_member` (`group_id`,`user_id`),
  ADD KEY `idx_gm_group` (`group_id`),
  ADD KEY `idx_gm_user` (`user_id`);

--
-- Indexes for table `join_group_requests`
--
ALTER TABLE `join_group_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_join_request` (`group_id`,`user_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_jr_group` (`group_id`);

--
-- Indexes for table `member_additional_documents`
--
ALTER TABLE `member_additional_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_mad_verification_id` (`verification_id`),
  ADD KEY `idx_mad_doc_type` (`document_type`);

--
-- Indexes for table `member_verifications`
--
ALTER TABLE `member_verifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `fk_mv_verified_by` (`verified_by`),
  ADD KEY `idx_mv_user_id` (`user_id`),
  ADD KEY `idx_mv_status` (`verification_status`),
  ADD KEY `idx_mv_nic` (`nic_number`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notif_user` (`user_id`),
  ADD KEY `idx_notif_read` (`is_read`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_cycle_member` (`cycle_id`,`member_id`),
  ADD KEY `recorded_by` (`recorded_by`),
  ADD KEY `idx_payments_cycle` (`cycle_id`),
  ADD KEY `idx_payments_member` (`member_id`),
  ADD KEY `idx_payments_status` (`status`);

--
-- Indexes for table `payment_cycles`
--
ALTER TABLE `payment_cycles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_group_cycle` (`group_id`,`cycle_number`),
  ADD KEY `payout_member_id` (`payout_member_id`),
  ADD KEY `idx_pc_group` (`group_id`);

--
-- Indexes for table `payment_evidences`
--
ALTER TABLE `payment_evidences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pe_payment` (`payment_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `generated_by` (`generated_by`),
  ADD KEY `idx_reports_type` (`type`);

--
-- Indexes for table `seettu_groups`
--
ALTER TABLE `seettu_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `seettu_type_id` (`seettu_type_id`),
  ADD KEY `shop_id` (`shop_id`),
  ADD KEY `idx_groups_status` (`status`),
  ADD KEY `idx_groups_created_by` (`created_by`);

--
-- Indexes for table `seettu_types`
--
ALTER TABLE `seettu_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `shops`
--
ALTER TABLE `shops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_shops_owner` (`owner_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `nic_number` (`nic_number`),
  ADD KEY `verified_by` (`verified_by`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_nic` (`nic_number`),
  ADD KEY `idx_users_kyc_status` (`kyc_status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `advance_payments`
--
ALTER TABLE `advance_payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `disputes`
--
ALTER TABLE `disputes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `dispute_evidences`
--
ALTER TABLE `dispute_evidences`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `emergency_requests`
--
ALTER TABLE `emergency_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `group_members`
--
ALTER TABLE `group_members`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `join_group_requests`
--
ALTER TABLE `join_group_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `member_additional_documents`
--
ALTER TABLE `member_additional_documents`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `member_verifications`
--
ALTER TABLE `member_verifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `payment_cycles`
--
ALTER TABLE `payment_cycles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `payment_evidences`
--
ALTER TABLE `payment_evidences`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `seettu_groups`
--
ALTER TABLE `seettu_groups`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `seettu_types`
--
ALTER TABLE `seettu_types`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shops`
--
ALTER TABLE `shops`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `advance_payments`
--
ALTER TABLE `advance_payments`
  ADD CONSTRAINT `advance_payments_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `seettu_groups` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `disputes`
--
ALTER TABLE `disputes`
  ADD CONSTRAINT `disputes_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `seettu_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `disputes_ibfk_2` FOREIGN KEY (`raised_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `disputes_ibfk_3` FOREIGN KEY (`resolved_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `dispute_evidences`
--
ALTER TABLE `dispute_evidences`
  ADD CONSTRAINT `dispute_evidences_ibfk_1` FOREIGN KEY (`dispute_id`) REFERENCES `disputes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `emergency_requests`
--
ALTER TABLE `emergency_requests`
  ADD CONSTRAINT `emergency_requests_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `seettu_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `emergency_requests_ibfk_2` FOREIGN KEY (`raised_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `emergency_requests_ibfk_3` FOREIGN KEY (`resolved_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `group_members`
--
ALTER TABLE `group_members`
  ADD CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `seettu_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `join_group_requests`
--
ALTER TABLE `join_group_requests`
  ADD CONSTRAINT `join_group_requests_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `seettu_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `join_group_requests_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `member_additional_documents`
--
ALTER TABLE `member_additional_documents`
  ADD CONSTRAINT `fk_mad_verification` FOREIGN KEY (`verification_id`) REFERENCES `member_verifications` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `member_verifications`
--
ALTER TABLE `member_verifications`
  ADD CONSTRAINT `fk_mv_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_mv_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`cycle_id`) REFERENCES `payment_cycles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payment_cycles`
--
ALTER TABLE `payment_cycles`
  ADD CONSTRAINT `payment_cycles_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `seettu_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_cycles_ibfk_2` FOREIGN KEY (`payout_member_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payment_evidences`
--
ALTER TABLE `payment_evidences`
  ADD CONSTRAINT `payment_evidences_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `seettu_groups`
--
ALTER TABLE `seettu_groups`
  ADD CONSTRAINT `seettu_groups_ibfk_1` FOREIGN KEY (`seettu_type_id`) REFERENCES `seettu_types` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `seettu_groups_ibfk_2` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `seettu_groups_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shops`
--
ALTER TABLE `shops`
  ADD CONSTRAINT `shops_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
