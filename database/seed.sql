-- SeettuManager Seed Data
USE seettu_manager;

-- ============================================================
-- Insert Seettu Types
-- ============================================================
INSERT INTO seettu_types (name, description) VALUES 
('Monetary', 'Traditional cash-based Seettu where members contribute money'),
('Non-Monetary', 'Item-based Seettu for goods and services');

-- ============================================================
-- Insert Admin User (password: Admin@123)
-- BCrypt hash generated for: Admin@123
-- ============================================================
INSERT INTO users (full_name, email, phone, password_hash, role, preferred_language, is_locked, failed_login_attempts) 
VALUES ('System Admin', 'admin@seetumanager.com', '0712345678', 
        '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iK6VXMmG', 
        'ADMIN', 'EN', FALSE, 0);

-- ============================================================
-- Insert Sample FAQs
-- ============================================================
INSERT INTO faqs (question, answer, category) VALUES 
('How to record a payment?', 'Go to Payments page, select the group and member, then click Record Payment. Fill in the amount and any notes, then submit.', 'Payments'),
('What is discipline score?', 'The discipline score is calculated based on your payment timeliness. Formula: 100 - [(LatePayments × 5) + (MissedPayments × 10) + (AvgDelayDays × 0.5)]. Categories: EXCELLENT (90-100), GOOD (75-89), FAIR (50-74), POOR (25-49), HIGH_RISK (0-24).', 'Scores'),
('How to join a group?', 'Go to the Groups page, find the group you want to join and click "Request to Join". The group organizer will review and approve your request.', 'Groups'),
('How to create a Seettu group?', 'Navigate to Groups page and click "Create Group". Fill in the group name, description, contribution amount, member count, cycle frequency, and type. Once created, members can request to join.', 'Groups'),
('What happens if I miss a payment?', 'Missing a payment negatively impacts your discipline score. The system marks it as MISSED and deducts 10 points from your score. The organizer will be notified.', 'Payments'),
('How does the payout schedule work?', 'When a group is created, the system automatically generates payment cycles. Each cycle, one member receives the total pot. The payout order is determined by the organizer.', 'Groups'),
('How to raise a dispute?', 'Go to the Disputes page and click "Raise Dispute". Select the group, choose the dispute type, and provide a description. You can also attach evidence files.', 'Disputes'),
('What is an emergency request?', 'If you face a financial emergency, you can request an early payout from your group. Go to Emergency page, select the group, enter the amount and reason. The organizer will review your request.', 'Emergency'),
('How to download my certificate?', 'After completing a Seettu cycle, go to the Certificates page. You can view and download your completion certificate as a PDF.', 'Certificates'),
('How to change my language?', 'Click the language switcher in the top navigation bar. You can choose between English, Sinhala (සිංහල), and Tamil (தமிழ்).', 'General');
