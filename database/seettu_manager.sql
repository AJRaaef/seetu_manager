-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 28, 2026 at 02:28 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `seettu_manager`
--

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
(1, 2, 'USER_REGISTERED', 'users', 2, 'New user registered: test@example.com', '2026-10-20 09:56:00'),
(2, 2, 'USER_LOGIN', 'users', 2, 'User logged in: test@example.com', '2026-10-20 09:56:07'),
(3, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-20 09:58:07'),
(4, 3, 'USER_REGISTERED', 'users', 3, 'New user registered: hamasakram2003@gmail.com', '2026-10-20 10:00:38'),
(5, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-20 10:25:34'),
(6, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-20 10:55:51'),
(7, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-20 10:58:12'),
(8, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-20 11:03:07'),
(9, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-20 11:04:04'),
(10, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-20 11:06:18'),
(11, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-20 11:06:43'),
(12, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-20 11:08:55'),
(13, 3, 'FORGOT_PASSWORD', 'users', 3, 'Password reset requested for: hamasakram2003@gmail.com', '2026-10-20 11:46:51'),
(14, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-20 11:49:47'),
(15, 8, 'USER_REGISTERED', 'users', 8, 'New user registered: newuser4278@test.com', '2026-10-20 11:49:47'),
(16, 8, 'USER_LOGIN', 'users', 8, 'User logged in: newuser4278@test.com', '2026-10-20 11:49:48'),
(17, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-20 11:54:16'),
(18, 9, 'USER_REGISTERED', 'users', 9, 'New user registered: hamasakram2002@gmail.com', '2026-10-21 22:05:51'),
(19, 10, 'USER_REGISTERED', 'users', 10, 'New user registered: hamasaaaa@gmail.com', '2026-10-21 22:09:04'),
(20, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-21 23:33:07'),
(21, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-21 23:34:22'),
(22, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-21 23:37:54'),
(23, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-22 02:57:41'),
(24, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-22 03:42:39'),
(25, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-22 03:45:34'),
(26, 3, 'PROFILE_PICTURE_UPDATED', 'users', 3, 'User Hamas Akram updated their profile picture.', '2026-10-22 04:06:50'),
(27, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-22 05:40:04'),
(28, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-22 05:42:03'),
(29, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-23 10:02:00'),
(30, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-23 10:17:00'),
(31, 12, 'USER_REGISTERED', 'users', 12, 'New user registered: akramsanoon70@gmail.com', '2026-10-23 10:18:09'),
(32, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-23 10:19:41'),
(33, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-23 10:20:34'),
(34, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-26 02:54:20'),
(35, 13, 'USER_REGISTERED', 'users', 13, 'New user registered: akram11@gmail.com', '2026-10-26 03:24:19'),
(36, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-26 03:26:43'),
(37, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-27 08:16:37'),
(38, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-27 08:17:01'),
(39, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-27 08:34:03'),
(40, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-27 09:27:14'),
(41, 14, 'USER_REGISTERED', 'users', 14, 'New user registered: org@gmail.com', '2026-10-27 11:53:50'),
(42, 14, 'VERIFICATION_SUBMITTED', 'member_verifications', 1, 'Member submitted identity verification with NIC 200222346654', '2026-10-27 11:55:36'),
(43, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-27 11:57:16'),
(44, 1, 'VERIFICATION_APPROVED', 'member_verifications', 1, 'Approved member verification for org (NIC: 200222346654)', '2026-10-27 11:57:28'),
(45, 14, 'USER_LOGIN', 'users', 14, 'User logged in: org@gmail.com', '2026-10-27 11:58:10'),
(46, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-27 12:01:59'),
(47, 3, 'GROUP_CREATED', 'seettu_groups', 4, 'Group created: New Kaaka', '2026-10-27 12:03:54'),
(48, 3, 'GROUP_CREATED', 'seettu_groups', 5, 'Group created: Kaaakas', '2026-10-27 12:05:57'),
(49, 6, 'MEMBER_ADDED', 'group_members', 12, 'Member added to group: Kaaakas', '2026-10-27 12:08:16'),
(50, 7, 'MEMBER_ADDED', 'group_members', 13, 'Member added to group: Kaaakas', '2026-10-27 12:08:24'),
(51, 14, 'MEMBER_ADDED', 'group_members', 14, 'Member added to group: Kaaakas', '2026-10-27 12:09:53'),
(52, 3, 'PAYMENT_RECORDED', 'payments', 9, 'Payment recorded for member: Nethmi Silva in cycle: 1', '2026-10-27 12:12:37'),
(53, 3, 'PAYMENT_UPDATED', 'payments', 8, 'Payment updated for member: Asrar Mohamed in cycle: 2', '2026-10-27 12:13:36'),
(54, 3, 'PAYMENT_RECORDED', 'payments', 10, 'Payment recorded for member: Asrar Mohamed in cycle: 12', '2026-10-27 12:16:26'),
(55, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-27 12:18:37'),
(56, 13, 'USER_LOGIN', 'users', 13, 'User logged in: akram11@gmail.com', '2026-10-27 12:20:17'),
(57, 13, 'VERIFICATION_SUBMITTED', 'member_verifications', 2, 'Member submitted identity verification with NIC 200325913312', '2026-10-27 12:21:18'),
(58, 1, 'USER_LOGIN', 'users', 1, 'User logged in: admin@seetumanager.com', '2026-10-27 12:22:18'),
(59, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-27 12:22:39'),
(60, 3, 'VERIFICATION_APPROVED', 'member_verifications', 2, 'Approved member verification for Akram (NIC: 200325913312)', '2026-10-27 12:22:50'),
(61, 13, 'MEMBER_ADDED', 'group_members', 15, 'Member added to group: Kaaakas', '2026-10-27 12:23:10'),
(62, 3, 'PAYMENT_RECORDED', 'payments', 11, 'Payment recorded for member: Akram in cycle: 1', '2026-10-27 12:23:31'),
(63, 3, 'PAYMENT_RECORDED', 'payments', 12, 'Payment recorded for member: Akram in cycle: 2', '2026-10-27 12:23:48'),
(64, 3, 'PAYMENT_RECORDED', 'payments', 13, 'Payment recorded for member: Akram in cycle: 3', '2026-10-27 12:24:04'),
(65, 13, 'USER_LOGIN', 'users', 13, 'User logged in: akram11@gmail.com', '2026-10-27 12:24:41'),
(66, 13, 'PAYMENT_UPDATED', 'payments', 11, 'Payment updated for member: Akram in cycle: 1', '2026-10-27 12:27:07'),
(67, 3, 'USER_LOGIN', 'users', 3, 'User logged in: hamasakram2003@gmail.com', '2026-10-28 06:22:48');

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `certificate_uuid` varchar(36) NOT NULL,
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `discipline_score` decimal(4,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `certificates`
--

INSERT INTO `certificates` (`id`, `user_id`, `group_id`, `certificate_uuid`, `issued_at`, `discipline_score`) VALUES
(1, 2, 2, '31fda690-299b-42f9-b83e-54b5e790e97c', '2026-10-23 10:07:00', NULL),
(2, 5, 3, '1297ead4-b59b-4b0f-9826-fe759804cef2', '2026-10-27 08:46:11', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `disputes`
--

CREATE TABLE `disputes` (
  `id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
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
(2, 'What is discipline score?', 'The discipline score is calculated based on your payment timeliness. Formula: 100 - [(LatePayments ├ù 5) + (MissedPayments ├ù 10) + (AvgDelayDays ├ù 0.5)]. Categories: EXCELLENT (90-100), GOOD (75-89), FAIR (50-74), POOR (25-49), HIGH_RISK (0-24).', 'Scores'),
(3, 'How to join a group?', 'Go to the Groups page, find the group you want to join and click \"Request to Join\". The group organizer will review and approve your request.', 'Groups'),
(4, 'How to create a Seettu group?', 'Navigate to Groups page and click \"Create Group\". Fill in the group name, description, contribution amount, member count, cycle frequency, and type. Once created, members can request to join.', 'Groups'),
(5, 'What happens if I miss a payment?', 'Missing a payment negatively impacts your discipline score. The system marks it as MISSED and deducts 10 points from your score. The organizer will be notified.', 'Payments'),
(6, 'How does the payout schedule work?', 'When a group is created, the system automatically generates payment cycles. Each cycle, one member receives the total pot. The payout order is determined by the organizer.', 'Groups'),
(7, 'How to raise a dispute?', 'Go to the Disputes page and click \"Raise Dispute\". Select the group, choose the dispute type, and provide a description. You can also attach evidence files.', 'Disputes'),
(8, 'What is an emergency request?', 'If you face a financial emergency, you can request an early payout from your group. Go to Emergency page, select the group, enter the amount and reason. The organizer will review your request.', 'Emergency'),
(9, 'How to download my certificate?', 'After completing a Seettu cycle, go to the Certificates page. You can view and download your completion certificate as a PDF.', 'Certificates'),
(10, 'How to change my language?', 'Click the language switcher in the top navigation bar. You can choose between English, Sinhala (ÓÀâÓÀÆÓÂéÓÀäÓÂ¢), and Tamil (Ó«ñÓ««Ó«┐Ó«┤Ó»ì).', 'General');

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

--
-- Dumping data for table `group_members`
--

INSERT INTO `group_members` (`id`, `group_id`, `user_id`, `status`, `joined_at`) VALUES
(1, 1, 3, 'ACTIVE', '2026-10-20 16:31:31'),
(2, 1, 5, 'ACTIVE', '2026-10-20 16:31:31'),
(3, 1, 6, 'ACTIVE', '2026-10-20 16:31:31'),
(4, 1, 7, 'ACTIVE', '2026-10-20 16:31:31'),
(5, 2, 3, 'ACTIVE', '2026-10-20 16:31:31'),
(6, 2, 5, 'ACTIVE', '2026-10-20 16:31:31'),
(7, 2, 6, 'ACTIVE', '2026-10-20 16:31:31'),
(8, 3, 3, 'ACTIVE', '2026-10-20 16:31:31'),
(9, 3, 7, 'ACTIVE', '2026-10-20 16:31:31'),
(10, 4, 3, 'ACTIVE', '2026-10-27 12:03:54'),
(11, 5, 3, 'ACTIVE', '2026-10-27 12:05:57'),
(12, 5, 6, 'ACTIVE', '2026-10-27 12:08:16'),
(13, 5, 7, 'ACTIVE', '2026-10-27 12:08:24'),
(14, 5, 14, 'ACTIVE', '2026-10-27 12:09:53'),
(15, 5, 13, 'ACTIVE', '2026-10-27 12:23:10');

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
  `description` text DEFAULT NULL,
  `document_image_path` varchar(500) NOT NULL,
  `document_name` varchar(150) NOT NULL,
  `document_type` varchar(50) NOT NULL,
  `uploaded_at` datetime(6) NOT NULL,
  `verification_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member_verifications`
--

CREATE TABLE `member_verifications` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `gn_certificate_image_path` varchar(500) NOT NULL,
  `gn_division` varchar(100) DEFAULT NULL,
  `gn_issue_date` date DEFAULT NULL,
  `nic_back_image_path` varchar(500) NOT NULL,
  `nic_front_image_path` varchar(500) NOT NULL,
  `nic_number` varchar(20) NOT NULL,
  `rejection_reason` text DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `verification_status` enum('PENDING','VERIFIED','REJECTED','INCOMPLETE') NOT NULL,
  `verified_at` datetime(6) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  `verified_by` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `member_verifications`
--

INSERT INTO `member_verifications` (`id`, `created_at`, `gn_certificate_image_path`, `gn_division`, `gn_issue_date`, `nic_back_image_path`, `nic_front_image_path`, `nic_number`, `rejection_reason`, `updated_at`, `verification_status`, `verified_at`, `user_id`, `verified_by`) VALUES
(1, '2026-10-27 17:25:35.000000', '/uploads/verifications/gn/14-1793121935497-87cf28.png', 'kandy', '2020-05-08', '/uploads/verifications/nic/back/14-1793121935490-f44bba.png', '/uploads/verifications/nic/front/14-1793121935447-1e166b.png', '200222346654', NULL, '2026-10-27 17:27:29.000000', 'VERIFIED', '2026-10-27 17:27:28.000000', 14, 1),
(2, '2026-10-27 17:51:17.000000', '/uploads/verifications/gn/13-1793123477870-74e605.png', 'D98/3 Kadugannawa', '2003-12-15', '/uploads/verifications/nic/back/13-1793123477860-d3d0cc.png', '/uploads/verifications/nic/front/13-1793123477837-999ba8.png', '200325913312', NULL, '2026-10-27 17:52:50.000000', 'VERIFIED', '2026-10-27 17:52:50.000000', 13, 3);

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

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, 6, 'Payment Reminder: Your installment of LKR 1000.00 for \'Village Women\'s Seettu\' (Cycle #2) is due on 2026-10-31. Please ensure your payment is settled on time.', 'PAYMENT_REMINDER', 0, '2026-10-24 12:28:16'),
(2, 7, 'Payment Reminder: Your installment of LKR 1000.00 for \'Village Women\'s Seettu\' (Cycle #2) is due on 2026-10-31. Please ensure your payment is settled on time.', 'PAYMENT_REMINDER', 0, '2026-10-24 12:28:18'),
(3, 3, 'Payment Reminder: Your installment of LKR 5000.00 for \'Small Business Seettu\' (Cycle #1) is due on 2026-10-31. Please ensure your payment is settled on time.', 'PAYMENT_REMINDER', 1, '2026-10-24 12:28:19'),
(4, 5, 'Payment Reminder: Your installment of LKR 5000.00 for \'Small Business Seettu\' (Cycle #1) is due on 2026-10-31. Please ensure your payment is settled on time.', 'PAYMENT_REMINDER', 0, '2026-10-24 12:28:19'),
(5, 6, 'Payment Reminder: Your installment of LKR 5000.00 for \'Small Business Seettu\' (Cycle #1) is due on 2026-10-31. Please ensure your payment is settled on time.', 'PAYMENT_REMINDER', 0, '2026-10-24 12:28:19'),
(6, 6, 'Payment Reminder: Your installment of LKR 1000.00 for \'Village Women\'s Seettu\' (Cycle #2) is due on 2026-10-31. Please ensure your payment is settled on time.', 'PAYMENT_REMINDER', 0, '2026-10-26 00:38:08'),
(7, 7, 'Payment Reminder: Your installment of LKR 1000.00 for \'Village Women\'s Seettu\' (Cycle #2) is due on 2026-10-31. Please ensure your payment is settled on time.', 'PAYMENT_REMINDER', 0, '2026-10-26 00:38:08'),
(8, 3, 'Payment Reminder: Your installment of LKR 5000.00 for \'Small Business Seettu\' (Cycle #1) is due on 2026-10-31. Please ensure your payment is settled on time.', 'PAYMENT_REMINDER', 1, '2026-10-26 00:38:08'),
(9, 5, 'Payment Reminder: Your installment of LKR 5000.00 for \'Small Business Seettu\' (Cycle #1) is due on 2026-10-31. Please ensure your payment is settled on time.', 'PAYMENT_REMINDER', 0, '2026-10-26 00:38:08'),
(10, 6, 'Payment Reminder: Your installment of LKR 5000.00 for \'Small Business Seettu\' (Cycle #1) is due on 2026-10-31. Please ensure your payment is settled on time.', 'PAYMENT_REMINDER', 0, '2026-10-26 00:38:08'),
(11, 14, 'Your identity verification (NIC: 200222346654) has been submitted successfully and is currently under review by administrators.', 'VERIFICATION_PENDING', 0, '2026-10-27 11:55:37'),
(12, 3, 'New Member Verification Submitted: org (NIC: 200222346654) is awaiting approval.', 'VERIFICATION_PENDING', 1, '2026-10-27 11:55:38'),
(13, 4, 'New Member Verification Submitted: org (NIC: 200222346654) is awaiting approval.', 'VERIFICATION_PENDING', 0, '2026-10-27 11:55:38'),
(14, 1, 'New Member Verification Submitted: org (NIC: 200222346654) is awaiting approval.', 'VERIFICATION_PENDING', 0, '2026-10-27 11:55:39'),
(15, 14, '🎉 Congratulations! Your identity verification (NIC: 200222346654) has been approved. You are now authorized to join Seettu circles.', 'VERIFICATION_APPROVED', 0, '2026-10-27 11:57:29'),
(16, 6, 'You have been added to group: Kaaakas', 'GROUP', 0, '2026-10-27 12:08:16'),
(17, 7, 'You have been added to group: Kaaakas', 'GROUP', 0, '2026-10-27 12:08:24'),
(18, 14, 'You have been added to group: Kaaakas', 'GROUP', 0, '2026-10-27 12:09:53'),
(19, 6, 'Your payment of 1000 has been recorded for cycle 1', 'PAYMENT', 0, '2026-10-27 12:12:37'),
(20, 7, 'Your payment of 1000 has been recorded for cycle 2', 'PAYMENT', 0, '2026-10-27 12:13:36'),
(21, 7, 'Your payment of 1000 has been recorded for cycle 12', 'PAYMENT', 0, '2026-10-27 12:16:26'),
(22, 13, 'Your identity verification (NIC: 200325913312) has been submitted successfully and is currently under review by administrators.', 'VERIFICATION_PENDING', 1, '2026-10-27 12:21:18'),
(23, 3, 'New Member Verification Submitted: Akram (NIC: 200325913312) is awaiting approval.', 'VERIFICATION_PENDING', 1, '2026-10-27 12:21:18'),
(24, 4, 'New Member Verification Submitted: Akram (NIC: 200325913312) is awaiting approval.', 'VERIFICATION_PENDING', 0, '2026-10-27 12:21:18'),
(25, 1, 'New Member Verification Submitted: Akram (NIC: 200325913312) is awaiting approval.', 'VERIFICATION_PENDING', 0, '2026-10-27 12:21:18'),
(26, 13, '🎉 Congratulations! Your identity verification (NIC: 200325913312) has been approved. You are now authorized to join Seettu circles.', 'VERIFICATION_APPROVED', 1, '2026-10-27 12:22:50'),
(27, 13, 'You have been added to group: Kaaakas', 'GROUP', 1, '2026-10-27 12:23:10'),
(28, 13, 'Your payment of 1000 has been recorded for cycle 1', 'PAYMENT', 1, '2026-10-27 12:23:31'),
(29, 13, 'Your payment of 1000 has been recorded for cycle 2', 'PAYMENT', 1, '2026-10-27 12:23:48'),
(30, 13, 'Your payment of 1000 has been recorded for cycle 3', 'PAYMENT', 1, '2026-10-27 12:24:04'),
(31, 13, 'Your payment of 1000 has been recorded for cycle 1', 'PAYMENT', 1, '2026-10-27 12:27:07');

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

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `cycle_id`, `member_id`, `amount`, `status`, `payment_date`, `recorded_by`, `notes`, `created_at`, `payment_method`) VALUES
(1, 1, 3, 1000.00, 'PAID', '2026-09-05', 3, 'On-time cash contribution', '2026-10-20 16:31:31', NULL),
(2, 1, 5, 1000.00, 'PAID', '2026-09-06', 3, 'Bank slip verified', '2026-10-20 16:31:31', NULL),
(3, 1, 6, 1000.00, 'PAID', '2026-09-10', 3, 'On-time payment', '2026-10-20 16:31:31', NULL),
(4, 1, 7, 1000.00, 'PAID', '2026-09-12', 3, 'Cash received', '2026-10-20 16:31:31', NULL),
(5, 2, 3, 1000.00, 'PAID', '2026-10-05', 3, 'October installment paid', '2026-10-20 16:31:31', NULL),
(6, 2, 5, 1000.00, 'PAID', '2026-10-08', 3, 'October installment verified', '2026-10-20 16:31:31', NULL),
(7, 2, 6, 1000.00, 'PENDING', NULL, NULL, 'Awaiting bank deposit slip', '2026-10-20 16:31:31', NULL),
(8, 2, 7, 1000.00, 'LATE', '2026-10-27', 3, 'Recorded via Payment Management portal', '2026-10-20 16:31:31', 'Cash (Offline)'),
(9, 18, 6, 1000.00, 'PAID', '2026-10-27', 3, 'Recorded via Payment Management portal', '2026-10-27 12:12:37', 'Cash (Offline)'),
(10, 29, 7, 1000.00, 'LATE', '2026-10-27', 3, 'Recorded via Payment Management portal', '2026-10-27 12:16:26', 'Cash (Offline)'),
(11, 18, 13, 1000.00, 'PENDING', '2026-10-27', NULL, 'Submitted by member with payment slip (Awaiting Approval)', '2026-10-27 12:23:31', 'Cash (Offline)'),
(12, 19, 13, 1000.00, 'LATE', '2026-10-27', 3, 'Recorded via Payment Management portal', '2026-10-27 12:23:48', 'Cash (Offline)'),
(13, 20, 13, 1000.00, 'LATE', '2026-10-27', 3, 'Recorded via Payment Management portal', '2026-10-27 12:24:04', 'Cash (Offline)');

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
  `status` enum('PENDING','ACTIVE','COMPLETED') NOT NULL DEFAULT 'PENDING',
  `max_payout_slots` int(11) DEFAULT NULL,
  `rotation_status` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_cycles`
--

INSERT INTO `payment_cycles` (`id`, `group_id`, `cycle_number`, `start_date`, `end_date`, `payout_member_id`, `status`, `max_payout_slots`, `rotation_status`) VALUES
(1, 1, 1, '2026-09-01', '2026-09-30', 3, 'PENDING', NULL, ''),
(2, 1, 2, '2026-10-01', '2026-10-31', 5, 'PENDING', NULL, ''),
(3, 1, 3, '2026-11-01', '2026-11-30', 6, 'PENDING', NULL, ''),
(4, 2, 1, '2026-10-01', '2026-10-31', 3, 'PENDING', NULL, ''),
(5, 2, 2, '2026-11-01', '2026-11-30', 5, 'PENDING', NULL, ''),
(6, 4, 1, '2026-10-27', '2026-11-26', 3, 'PENDING', NULL, ''),
(7, 4, 2, '2026-11-27', '2026-12-26', NULL, 'PENDING', NULL, ''),
(8, 4, 3, '2026-12-27', '2027-01-26', NULL, 'PENDING', NULL, ''),
(9, 4, 4, '2027-01-27', '2027-02-26', NULL, 'PENDING', NULL, ''),
(10, 4, 5, '2027-02-27', '2027-03-26', NULL, 'PENDING', NULL, ''),
(11, 4, 6, '2027-03-27', '2027-04-26', NULL, 'PENDING', NULL, ''),
(12, 4, 7, '2027-04-27', '2027-05-26', NULL, 'PENDING', NULL, ''),
(13, 4, 8, '2027-05-27', '2027-06-26', NULL, 'PENDING', NULL, ''),
(14, 4, 9, '2027-06-27', '2027-07-26', NULL, 'PENDING', NULL, ''),
(15, 4, 10, '2027-07-27', '2027-08-26', NULL, 'PENDING', NULL, ''),
(16, 4, 11, '2027-08-27', '2027-09-26', NULL, 'PENDING', NULL, ''),
(17, 4, 12, '2027-09-27', '2027-10-26', NULL, 'PENDING', NULL, ''),
(18, 5, 1, '2026-10-27', '2026-11-26', 3, 'PENDING', NULL, ''),
(19, 5, 2, '2026-11-27', '2026-12-26', NULL, 'PENDING', NULL, ''),
(20, 5, 3, '2026-12-27', '2027-01-26', NULL, 'PENDING', NULL, ''),
(21, 5, 4, '2027-01-27', '2027-02-26', NULL, 'PENDING', NULL, ''),
(22, 5, 5, '2027-02-27', '2027-03-26', NULL, 'PENDING', NULL, ''),
(23, 5, 6, '2027-03-27', '2027-04-26', NULL, 'PENDING', NULL, ''),
(24, 5, 7, '2027-04-27', '2027-05-26', NULL, 'PENDING', NULL, ''),
(25, 5, 8, '2027-05-27', '2027-06-26', NULL, 'PENDING', NULL, ''),
(26, 5, 9, '2027-06-27', '2027-07-26', NULL, 'PENDING', NULL, ''),
(27, 5, 10, '2027-07-27', '2027-08-26', NULL, 'PENDING', NULL, ''),
(28, 5, 11, '2027-08-27', '2027-09-26', NULL, 'PENDING', NULL, ''),
(29, 5, 12, '2027-09-27', '2027-10-26', NULL, 'PENDING', NULL, '');

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

--
-- Dumping data for table `payment_evidences`
--

INSERT INTO `payment_evidences` (`id`, `payment_id`, `file_path`, `uploaded_at`) VALUES
(1, 11, '/uploads/payments/slip_11_1793123828234.png', '2026-10-27 12:27:08');

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

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `title`, `type`, `file_path`, `generated_by`, `created_at`) VALUES
(1, 'Monthly Group Summary Audit', 'PAYMENT_AUDIT', './reports/PAYMENT_AUDIT_1792517125742.pdf', 1, '2026-10-20 11:55:26');

-- --------------------------------------------------------

--
-- Table structure for table `rotation_assignments`
--

CREATE TABLE `rotation_assignments` (
  `id` bigint(20) NOT NULL,
  `assigned_number` int(11) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `spin_result` varchar(50) DEFAULT NULL,
  `spun_at` datetime(6) DEFAULT NULL,
  `cycle_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

--
-- Dumping data for table `seettu_groups`
--

INSERT INTO `seettu_groups` (`id`, `name`, `description`, `contribution_amount`, `member_count`, `cycle_frequency`, `status`, `seettu_type_id`, `category`, `shop_id`, `created_by`, `created_at`) VALUES
(1, 'Village Women\'s Seettu', 'Monthly savings pool for village self-help micro-entrepreneurs', 1000.00, 10, 'MONTHLY', 'PENDING', 1, 'GENERAL', NULL, 3, '2026-10-20 16:31:31'),
(2, 'Small Business Seettu', 'Capital investment circle for local shopkeepers and traders', 5000.00, 8, 'MONTHLY', 'PENDING', 1, 'GENERAL', NULL, 3, '2026-10-20 16:31:31'),
(3, 'Community Farmer\'s Group', 'Agricultural machinery & seasonal cultivation non-monetary asset pool', 2000.00, 12, 'MONTHLY', 'PENDING', 2, 'GOLD', NULL, 3, '2026-10-20 16:31:31'),
(4, 'New Kaaka', 'cjsBCbnsJCbsM', 12000.00, 12, 'MONTHLY', 'PENDING', 1, 'Cash', NULL, 3, '2026-10-27 12:03:54'),
(5, 'Kaaakas', 'HammasbsssnA', 1000.00, 12, 'MONTHLY', 'PENDING', 1, 'cash', NULL, 3, '2026-10-27 12:05:57');

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
  `profile_picture_url` varchar(500) DEFAULT NULL,
  `locked_until` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `nic_number`, `gn_certificate_url`, `kyc_status`, `kyc_rejection_reason`, `verified_by`, `verified_at`, `password_hash`, `role`, `preferred_language`, `is_locked`, `failed_login_attempts`, `created_at`, `address`, `district`, `organizer_application_note`, `requested_role`, `profile_picture_url`, `locked_until`) VALUES
(1, 'System Admin', 'admin@seetumanager.com', '0712345678', NULL, NULL, 'UNVERIFIED', NULL, NULL, NULL, '$2a$10$sfzOSGxGUr1yIQJqyz3rsez9M.1VkBssHPcUB/W0ubwPuimSl8KwW', 'ADMIN', 'EN', 0, 0, '2026-10-20 15:22:04', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'Test User', 'test@example.com', '0771234567', NULL, NULL, 'UNVERIFIED', NULL, NULL, NULL, '$2a$10$5l/sv5l3IDBEPGQ1t420MujHFWdWHCBhMkivBi7OCOFaV8vHopOZa', 'MEMBER', 'EN', 0, 0, '2026-10-20 09:55:59', NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Hamas Akram', 'hamasakram2003@gmail.com', '0770795433', '200312345678', NULL, 'VERIFIED', NULL, NULL, NULL, '$2a$10$3Ae5hh4v86FRRdFt/p2OuO/mHaDYCTcGniYa5wCj3/4cVxh5WFs1O', 'ORGANIZER', 'EN', 0, 0, '2026-10-20 10:00:38', NULL, NULL, NULL, NULL, '/uploads/profiles/profile_user_3_7029a250.png', NULL),
(4, 'Reeha Hanan', 'reeha@gmail.com', '0771112233', '199512345678', NULL, 'VERIFIED', NULL, NULL, NULL, '$2a$10$5l/sv5l3IDBEPGQ1t420MujHFWdWHCBhMkivBi7OCOFaV8vHopOZa', 'ORGANIZER', 'EN', 0, 0, '2026-10-20 16:31:31', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'Jone Perera', 'jone@example.com', '0772223344', '199812345678', NULL, 'VERIFIED', NULL, NULL, NULL, '$2a$10$5l/sv5l3IDBEPGQ1t420MujHFWdWHCBhMkivBi7OCOFaV8vHopOZa', 'MEMBER', 'EN', 0, 0, '2026-10-20 16:31:31', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'Nethmi Silva', 'nethmi@example.com', '0773334455', '200112345678', NULL, 'VERIFIED', NULL, NULL, NULL, '$2a$10$5l/sv5l3IDBEPGQ1t420MujHFWdWHCBhMkivBi7OCOFaV8vHopOZa', 'MEMBER', 'EN', 0, 0, '2026-10-20 16:31:31', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'Asrar Mohamed', 'asrar@example.com', '0774445566', '200012345678', NULL, 'VERIFIED', NULL, NULL, NULL, '$2a$10$5l/sv5l3IDBEPGQ1t420MujHFWdWHCBhMkivBi7OCOFaV8vHopOZa', 'MEMBER', 'EN', 0, 0, '2026-10-20 16:31:31', NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'Kasun Perera 4278', 'newuser4278@test.com', '0716447047', NULL, NULL, 'UNVERIFIED', NULL, NULL, NULL, '$2a$10$6XiKo5CVXVIV9XpZ8dDFz.nedRX6vlgS3bQiIoYsFIy3X4tKgrZNm', 'MEMBER', 'EN', 0, 0, '2026-10-20 11:49:47', NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'Hamas Akram', 'hamasakram2002@gmail.com', '0770795438', NULL, NULL, 'UNVERIFIED', NULL, NULL, NULL, '$2a$10$sd9usbzICqbUoihke2SO6OrtG7Zo5y/KpwmcYeP3zqzr1gEJXkdxm', 'MEMBER', 'EN', 0, 0, '2026-10-21 22:05:50', NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'hamasaaaa', 'hamasaaaa@gmail.com', '0770798321', NULL, NULL, 'UNVERIFIED', NULL, NULL, NULL, '$2a$10$dn6uLI6W6qn1NjLW/lfW8uUlrRaENYXvCPV5WxmZCLcpidoO2QMa2', 'MEMBER', 'EN', 0, 0, '2026-10-21 22:09:04', NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'Akram Sanoon', 'akramsanoon70@gmail.com', '0123456789', NULL, NULL, 'UNVERIFIED', NULL, NULL, NULL, '$2a$10$DqufJNk2xWunoGf7N3uoxeO8/V48y22t7sQ.mltQa1PpyYln.tgey', 'MEMBER', 'EN', 0, 0, '2026-10-23 10:18:09', NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'Akram', 'akram11@gmail.com', '0771234569', '200325913312', '/uploads/verifications/gn/13-1793123477870-74e605.png', 'VERIFIED', NULL, 3, '2026-10-27 12:22:50', '$2a$10$QyLdAddKrGN4QbR/rNooEeFi4hQ4Oq5SxmLHQd6COxElvvogn06Sa', 'MEMBER', 'EN', 0, 0, '2026-10-26 03:24:18', NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'org', 'org@gmail.com', '0776545323', '200222346654', '/uploads/verifications/gn/14-1793121935497-87cf28.png', 'VERIFIED', NULL, 1, '2026-10-27 11:57:28', '$2a$10$5xraPFx8wjBl8Oj2/uEmuexmFP.tmoBCZgX1WIEr55hZ.904hJesC', 'MEMBER', 'EN', 0, 0, '2026-10-27 11:53:50', NULL, NULL, NULL, NULL, NULL, NULL);

--
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
  ADD KEY `FKo7l28s1a2x7q2rq1txcskk9r7` (`verification_id`);

--
-- Indexes for table `member_verifications`
--
ALTER TABLE `member_verifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_e6qgh2atnkmx3nnxcxt1dpg81` (`user_id`),
  ADD KEY `FKg20gh8y3ispldsgo8l4fxct4k` (`verified_by`);

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
-- Indexes for table `rotation_assignments`
--
ALTER TABLE `rotation_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKqfdtbi6lowmb15rkqnurafmjj` (`cycle_id`,`user_id`),
  ADD KEY `FKtescokdee4j0ke4n5fcbgo7ry` (`user_id`);

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `disputes`
--
ALTER TABLE `disputes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dispute_evidences`
--
ALTER TABLE `dispute_evidences`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `emergency_requests`
--
ALTER TABLE `emergency_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `group_members`
--
ALTER TABLE `group_members`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `join_group_requests`
--
ALTER TABLE `join_group_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `member_additional_documents`
--
ALTER TABLE `member_additional_documents`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `member_verifications`
--
ALTER TABLE `member_verifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `payment_cycles`
--
ALTER TABLE `payment_cycles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `payment_evidences`
--
ALTER TABLE `payment_evidences`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `rotation_assignments`
--
ALTER TABLE `rotation_assignments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `seettu_groups`
--
ALTER TABLE `seettu_groups`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `seettu_types`
--
ALTER TABLE `seettu_types`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shops`
--
ALTER TABLE `shops`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
  ADD CONSTRAINT `FKo7l28s1a2x7q2rq1txcskk9r7` FOREIGN KEY (`verification_id`) REFERENCES `member_verifications` (`id`);

--
-- Constraints for table `member_verifications`
--
ALTER TABLE `member_verifications`
  ADD CONSTRAINT `FKg20gh8y3ispldsgo8l4fxct4k` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKp28gr5r0uqmtgf0vec6x3torn` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

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
-- Constraints for table `rotation_assignments`
--
ALTER TABLE `rotation_assignments`
  ADD CONSTRAINT `FK89hbpuge9jxix2cgwdj59gt8a` FOREIGN KEY (`cycle_id`) REFERENCES `payment_cycles` (`id`),
  ADD CONSTRAINT `FKtescokdee4j0ke4n5fcbgo7ry` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
