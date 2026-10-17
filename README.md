# SeettuManager

> **A Digital Financial Discipline System for Rotating Savings Groups in Sri Lanka**  
> **National Diploma in Technology (NDT) in Information Technology — Final Capstone Project**  
> **Institute of Technology, University of Moratuwa (ITUM)**

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-Academic-blue?style=for-the-badge)]()

---

## 📌 Project Overview

**SeettuManager** is an enterprise-grade, mobile-responsive web platform designed to digitize, secure, and modernize traditional Rotating Savings and Credit Associations (ROSCAs), universally known across Sri Lanka as **Seettu (සීට්ටු / சீட்டு)**.

Traditional Seettu circles are a vital grassroots financial lifeline for micro-entrepreneurs, rural self-help groups, and salaried workers who lack formal bank collateral. However, traditional circles suffer from handwritten paper ledger errors, lack of audit transparency, record destruction, and default flight risks.

**SeettuManager** resolves these issues by introducing a **non-custodial digital ledger**:
- Contributions occur offline or via direct bank transfer, preserving community autonomy and eliminating custodial banking friction.
- The platform functions as the tamper-proof digital validator, cycle scheduler, and credit auditor.
- Evaluates individual repayment trustworthiness using an automated algorithmic **Financial Discipline Score ($0–100$)**.
- Protects members through bank slip evidence verification, emergency relief liquidity mechanisms, and structured dispute arbitration in strict alignment with *The Cheetus Ordinance No. 61 of 1935*.

---

## ✨ Key Capabilities & Implemented Features

### 1. Multi-Model Seettu Group Management
* **Fixed Rotational Seettu:** Automated turn allocation based on predetermined member queues.
* **Auction & Bidding Seettu:** Competitive discount bidding during cycle windows, automatically recalculating member dividends to reduce out-of-pocket installments.
* **Random Draw / Lottery Seettu:** Neutral algorithmic selection for fair community turn allocation.
* **Non-Monetary Asset Seettu:** Rotation pools for physical commodities and tangible assets (sovereign gold jewelry, agricultural machinery, vehicles) with certified valuation entries.

### 2. Comprehensive Payment Tracking & Evidence Verification
* **Lifecycle Status Tracking:** Contributions classified in real time as `PAID`, `PENDING`, `PARTIAL`, `LATE`, or `OVERDUE`.
* **Bank Deposit Slip Uploads:** Members attach digital payment receipts (`.png`, `.jpg`, `.pdf`) for organizer verification via modal view.
* **Advance Payments Ledger:** Support for advance contribution deposits and automatic rollover reconciliations for upcoming cycles.
* **Double-Payment Prevention:** Database-level composite constraints (`cycle_id` + `member_id`) ensure financial ledger integrity.

### 3. Algorithmic Financial Discipline Scoring ($0–100$)
An objective mathematical credit metric designed to evaluate member reliability without invasive banking bureaucracy:
$$\text{Discipline Score} = \max\left(0,\, 100 - \left[(\text{Late Payments} \times 5) + (\text{Missed Payments} \times 10) + (\text{Average Delay Days} \times 0.5)\right]\right)$$

* **Score Tiers:**
  * **$80 – 100$ (Excellent):** Prompt contributor; eligible for early payout allocations and high-capital circles.
  * **$65 – 79$ (Good):** Reliable standing with minor isolated delays; standard eligibility.
  * **$50 – 64$ (Moderate):** Monitored standing; restricted from high-stakes bidding and requires organizer review.
  * **$< 50$ (High-Risk):** Default risk; flagged for organizer oversight and circle restrictions.

### 4. Real-Time Notification Center & Multi-Channel Reminders
* **Interactive In-App Notification Center:**
  * Live unread badge counters and category filtering chips (`All`, `Unread`, `Payments`, `Groups`, `Disputes`, `General`).
  * Replaced unicode emojis with real Lucide vector line-art icons (`<Icon name="user" />`, `<Icon name="globe" />`, `<Icon name="check" />`, `<Icon name="clock" />`).
  * Dual View Mode: Seamless toggle between personal inbox and system-wide activity logs for Organizers and System Administrators.
  * One-click batch mark as read (`PUT /api/notifications/user/{userId}/read-all`).
* **Automated Daily Schedulers:**
  * **9:00 AM Cron (`ScheduledTasks.java`):** Scans active cycles due within 7 days, evaluates non-settled member records, and dispatches automated payment reminders.
  * **Midnight Cron:** Flags overdue payments past the 7-day cutoff and updates discipline penalties.
* **Multi-Channel Dispatch Support:**
  * **In-App:** Real-time database alerts stored in the `notifications` table.
  * **WhatsApp:** Instant one-click Click-to-Chat URL generation (`https://wa.me/94...`) with international phone formatting and pre-filled payment reminder text.
  * **SMS:** Native device messaging protocols (`sms:+94...?body=...`) and telecom gateway endpoints.
  * **Email:** Automated transactional notification templates for account and cycle updates.

### 5. Multi-Level Dispute Resolution & Emergency Relief
* **Structured Arbitration:** Members submit formal dispute tickets with file attachments; organizers review internally or escalate to System Administrators (`OPEN`, `UNDER_REVIEW`, `RESOLVED`, `REJECTED`).
* **Emergency Relief Reserve:** Verified members facing unexpected life emergencies can request prioritized liquidity or temporary contribution relief from the group pool.

### 6. Digital Certificates & PDF Financial Reporting
* **Verifiable Discipline Certificates:** Cryptographically verified completion certificates featuring unique IDs (e.g., `SL-CERT-XXXXX`).
* **Instant Financial Statements:** Exportable PDF summaries via iText, circle collection records, and CSV audit reports.

### 7. Trilingual Localization & Rule-Based Seettu FAQ Chatbot
* **Trilingual Localization:** Instant dynamic language switching between **English**, **සිංහල (Sinhala)**, and **தமிழ் (Tamil)** without page reload.
* **Rule-Based Seettu FAQ Chatbot (`ChatbotService.java` & `ChatbotWidget.jsx`):**
  * A deterministic, privacy-first interactive assistant with token scoring and topic-intent recognition.
  * Queries database-backed FAQs (`faqs` table) with instant fallbacks.
  * Provides quick-prompt chips for Cheetus Ordinance statutory legal compliance, step-by-step payment instructions, discipline score formula calculations, cycle payout rules, member exit/cancellation rules, and official Colombo support desk helplines.

---

## 👥 Project Team & Work Allocation

Developed by **Group 15** — National Diploma in Technology (IT), Institute of Technology, University of Moratuwa (ITUM):

| Member Name | Index Number | Primary Role & Core Modules | Email | GitHub |
| :--- | :---: | :--- | :--- | :--- |
| **A.J. Raaef** *(Leader)* | `23IT0516` | System Architecture, Security & Backend Lead | — | [@AJRaaef](https://github.com/AJRaaef) |
| **M.R. Hanan** | `23IT0480` | Database Design, Seettu Cycle & Payment UI Lead | `reezmahanan@gmail.com` | [@reezmahanan](https://github.com/reezmahanan) |
| **B.A.P. Nethmi** | `23IT0509` | React Frontend, Group & Member Management Lead | `pamodyanethmi2002@gmail.com` | [@PamodyaNethmi](https://github.com/PamodyaNethmi) |
| **M.A. Hamas** | `23IT0479` | Financial Discipline, Risk Analytics & Certificates Lead | — | [@HamasAkram03](https://github.com/HamasAkram03) |
| **N.M. Asrar** | `23IT0456` | Dispute Management, Notifications & Testing Lead | — | [@asrarDev-tech](https://github.com/asrarDev-tech) |
| **W.V. Shashiprabha** | `23IT0535` | Multi-Language, Audit Trail, FAQ Chatbot & Documentation Lead | `vichakshi245@gmail.com` | [@Vichakshi-Shashiprabha](https://github.com/Vichakshi-Shashiprabha) |

---

### Detailed Deliverables by Team Member

#### 1. A.J. Raaef — System Architecture, Authentication, Authorization & Security
* **Assigned Work:**
  * System Architecture and Three-Tier Architecture design.
  * Spring Boot backend structure, package design, and modular configuration.
  * User Registration and Login endpoints with input sanitization.
  * JWT Authentication (stateless token generation, claims extraction & validation).
  * Role-Based Access Control (RBAC) for Admin, Organizer, and Member roles.
  * Password Management and Forgot Password workflows with token expiry.
  * Account Locking and Login Security safeguards to prevent brute-force attacks.
  * Backend Security filters, CORS configurations, and Protected API routes.
  * Input Validation and Global Exception Handling.
* **Main Deliverables:**
  * System architecture diagrams and technical specifications.
  * Authentication module (`/api/auth/**`).
  * Authorization and RBAC security layer (`SecurityConfig.java`, `JwtAuthenticationFilter.java`).
  * Secure REST API endpoints and user credentials management.

---

#### 2. M.R. Hanan — Database, Seettu Cycle, Payment Tracking & Payment Management UI
* **Assigned Work:**
  * **Database & Backend Architecture:**
    * MySQL Database Design (18 normalized relational tables).
    * Primary/Foreign Keys, unique constraints, composite keys, and performance indexing.
    * Entity Relationship (ER) diagram modeling.
    * JPA / Hibernate Entity mappings (`User`, `Group`, `Payment`, `PaymentCycle`, `Notification`...).
    * Seettu Group Cycle Engine (`PaymentCycleService.java`).
    * Contribution and Payout Schedule Management.
    * Payment Recording and Tracking (`PaymentService.java`).
    * Payment Status Management (`PAID`, `PENDING`, `LATE`, `OVERDUE`).
    * Partial payment handling, advance payments ledger, and double-payment prevention.
    * Scheduled payment reminder engine and non-settled cycle evaluation.
    * Bank deposit slip multi-part file uploads and verification audit trails.
  * **Frontend — Payment Management UI:**
    * Master Payment Management Interface (`PaymentTracking.jsx`, `PaymentManagement.jsx`).
    * Quick Payment Recording Form and Receipt Slip Modal with upload verification.
    * Color-coded Payment Status Badges and Advance Fund Rollover Views.
    * Statistical Summary Cards with dynamic cycle progress bars.
    * Payment-related form validation and live filterable history tables.
    * Payment REST API Integration service (`paymentApi.js`).
* **Main Deliverables:**
  * MySQL database schema (`database/Schema.sql`) & seeds (`database/Seed.sql`).
  * JPA Entity Relationship Model and Hibernate configurations.
  * Seettu cycle management module (`/api/payment-cycles/**`).
  * Payment tracking backend module (`/api/payments/**`).
  * Payment management frontend screens, modals, and receipt viewer.
  * Database documentation and data dictionary.

---

#### 3. B.A.P. Nethmi — React Frontend, Group & Member Management
* **Assigned Work:**
  * **Frontend Structure & Layout:**
    * React.js Frontend architecture and Vite build tooling setup.
    * Master responsive layout (`AppLayout.jsx`, `Topbar.jsx`, `Sidebar.jsx`).
    * Common UI components, modal dialogs, and navigation menus.
    * Public Hero Landing Page (`LandingPage.jsx`) with dynamic statistics.
    * User Login and Registration interfaces with client-side validation.
  * **Group & Member Portals:**
    * Group Management Interface (`MyGroups.jsx`, `GroupDetail.jsx`).
    * Multi-step Group Creation Wizard (`CreateGroup.jsx`) for monetary and non-monetary models.
    * Member Management Interface (approval queues, add/remove members, role management).
    * Member Portal screens and personalized group participation dashboards.
    * Responsive mobile hamburger navigation and cross-device testing.
* **Main Deliverables:**
  * React SPA structure, navigation routing (`App.jsx`), and responsive CSS styling.
  * Group management and creation screens.
  * Member management and onboarding interfaces.
  * Main user dashboard and metric summary widgets.
  * Frontend REST API client services for groups and members.

---

#### 4. M.A. Hamas — Financial Discipline, Risk Detection, Analytics, Reports & Certificates
* **Assigned Work:**
  * Financial Discipline Score calculation algorithm implementation ($0–100$).
  * Member discipline score history tracking and penalty deduction logic.
  * Score categories and Risk Levels (*Excellent, Good, Moderate, High-Risk*).
  * High-Risk member identification, flag triggers, and organizer alert mechanisms.
  * Score trend analysis and historical progression graphing.
  * Group performance analytics and payment contribution completion metrics.
  * iText PDF Financial Report Generation (monthly group summaries, payout receipts).
  * CSV Report Export functionality for offline ledger archiving.
  * Verifiable Digital Certificate Generation upon successful Seettu completion.
* **Main Deliverables:**
  * Financial discipline scoring engine (`DisciplineScoreService.java`).
  * Risk detection, alerting, and ranking logic.
  * Dashboard analytics calculators and visual progress metrics.
  * iText PDF report generator.
  * CSV export utility.
  * Digital certificate issuance and validation module.

---

#### 5. N.M. Asrar — Dispute Management, Notifications & Testing
* **Assigned Work:**
  * **Dispute Arbitration Module:**
    * Dispute submission interface (`Disputes.jsx`) with evidence attachment capabilities.
    * Dispute categories, unique Reference ID generation, and audit records.
    * Dispute Status Lifecycle (`OPEN`, `UNDER_REVIEW`, `RESOLVED`, `REJECTED`).
    * Organizer dispute resolution interface and admin escalation pathway.
  * **Notification Subsystem:**
    * In-app notification center (`Notifications.jsx`) with Lucide vector line-art icons.
    * View Mode toggle between personal notifications and system-wide activity logs.
    * Batch "Mark All Read" API endpoint implementation.
    * Event notification hooks (cycle due dates, slip uploads, dispute status updates).
  * **Quality Assurance & Testing:**
    * Functional testing across all user workflows.
    * Frontend-backend REST API integration testing.
    * Edge case and boundary condition verification.
* **Main Deliverables:**
  * Dispute resolution backend module (`DisputeController.java`, `DisputeService.java`) and UI.
  * Notification center UI and REST service (`NotificationController.java`, `NotificationService.java`).
  * Test execution cases, integration validation, and defect tracking reports.

---

#### 6. W.V. Shashiprabha — Multi-Language, Audit Trail, Seettu FAQ Chatbot & Documentation
* **Assigned Work:**
  * **Trilingual Localization:**
    * Trilingual language support (**Sinhala**, **Tamil**, and **English**).
    * Dynamic language switching without page reload via React LanguageContext.
    * Multi-language UI dictionaries (`translations.js`) and font rendering for Sinhala/Tamil Unicode.
  * **Audit Trail & System Monitoring:**
    * System-wide Audit Trail engine recording security actions in `audit_logs`.
    * User action history (logins, role changes, payment verifications).
  * **Rule-Based Seettu FAQ Chatbot:**
    * Interactive Seettu Assistant chatbot widget (`ChatbotWidget.jsx`).
    * Backend token matching and database FAQ retrieval engine (`ChatbotService.java`).
    * Statutory Cheetus Ordinance guidance, cycle payment steps, score formulas, and helpline lookups.
  * **Documentation:**
    * User Manuals, Administrator guides, and system documentation.
* **Main Deliverables:**
  * Trilingual localization engine (`translations.js`, `LanguageContext.jsx`).
  * Audit logging module (`AuditLogService.java`).
  * Rule-based Seettu FAQ Chatbot assistant.
  * System User Manuals and Final Project Documentation.

---

### 🤝 Shared Team Responsibilities

All six members actively collaborate on:
1. **GitHub Repository Management:** Git branching strategy (`main`, `dev`, feature branches), pull request reviews, and commit hygiene.
2. **System & API Integration:** Aligning REST JSON contracts, HTTP status codes, and error payloads.
3. **Peer Code Reviews:** Ensuring strict coding conventions, security filters, and maintainability.
4. **Database Integration:** Schema migrations, foreign key enforcement, and test seed generation.
5. **UI & Usability Review:** Cross-device validation for responsive desktop, tablet, and mobile views.
6. **Regression Testing & Bug Fixing:** Comprehensive end-to-end defect resolution.
7. **Viva & Presentation Preparation:** Technical documentation, slides, and live demonstration choreography.

---

## 🏗️ System Architecture

SeettuManager is built on a decoupled, scalable **Three-Tier Architecture**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                        PRESENTATION TIER (UI)                          │
 │         React 18  •  Vite 5  •  Bootstrap 5  •  Lucide Icons           │
 │       Trilingual Context (EN / SI / TA)  •  Responsive Shell           │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ Secure JSON / REST via Axios
 ┌───────────────────────────────────▼────────────────────────────────────┐
 │                      APPLICATION TIER (BACKEND)                        │
 │           Spring Boot 3.2.x (Java 17)  •  Spring Security              │
 │  • Auth & RBAC (JWT)               • Seettu Cycle Scheduler Engine     │
 │  • Payment Verification Engine     • Financial Discipline Algorithm    │
 │  • Dispute & Escalation Manager    • Scheduled Tasks (Cron Reminders)  │
 │  • Rule-Based FAQ Chatbot Engine   • Audit Log Interceptor             │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ JPA / Hibernate ORM
 ┌───────────────────────────────────▼────────────────────────────────────┐
 │                         DATA TIER (STORAGE)                            │
 │             MySQL 8.0+ Relational Database (18 Core Tables)            │
 │   users, groups, group_members, payment_cycles, payments,             │
 │   advance_payments, notifications, disputes, faqs, audit_logs...       │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries / Frameworks |
| :--- | :--- | :--- |
| **Frontend** | React 18 (JavaScript) | Vite 5, React Router DOM 6, Bootstrap 5, Lucide React, Axios |
| **Backend** | Java 17 | Spring Boot 3.2.5, Spring Security, Spring Data JPA, Lombok, Jakarta Validation |
| **Security** | JWT (JSON Web Tokens) | `jjwt-api 0.11.5`, BCrypt Password Encoder, Stateless Session |
| **Database** | MySQL 8.0+ | Hibernate 6 ORM, HikariCP Connection Pooling, 18 Relational Tables |
| **Task Engine** | Spring Scheduling | `@Scheduled` Cron Jobs (9:00 AM Payment Reminders, Midnight Overdue Checks) |
| **FAQ Assistant** | Rule-Based / NLP Token Scoring | Keyword Scoring Engine, Intent Matcher, Database FAQ Store (`faqs` table) |
| **Document/Media**| PDF & File Storage | iText PDF Generation, Multi-Part File Uploads (`./uploads`) |

---

## 📁 Repository Directory Structure

```
seetu_manager/
├── backend/                                   # Spring Boot Enterprise Application
│   ├── src/main/java/com/seettu/manager/
│   │   ├── config/                            # Security, CORS, WebMvc configuration
│   │   ├── controller/                        # REST Controllers (Auth, Groups, Payments, Notifications...)
│   │   ├── dto/                               # Data Transfer Objects & API Request/Response models
│   │   ├── entity/                            # JPA Database Entities (User, Group, Payment, Cycle...)
│   │   ├── exception/                         # Global Exception Handlers & custom exceptions
│   │   ├── repository/                        # Spring Data JPA Repositories
│   │   ├── security/                          # JWT Token Filters, UserDetailsService
│   │   ├── service/                           # Business logic (PaymentService, NotificationService, ChatbotService...)
│   │   └── util/                              # ScheduledTasks, AuditLogService
│   ├── src/main/resources/
│   │   └── application.properties             # Database credentials, JWT Secret, Server Port 8081
│   ├── uploads/                               # Stored bank slips and identity certificates
│   └── pom.xml                                # Maven build specification
│
├── frontend/                                  # React.js Single Page Application
│   ├── public/                                # Favicons, logos, showcase images
│   ├── src/
│   │   ├── api/                               # Axios API service integrations (paymentApi, chatbotApi...)
│   │   ├── components/                        # Reusable UI widgets (Topbar, Sidebar, Icons, ChatbotWidget...)
│   │   ├── contexts/                          # AuthContext, LanguageContext, ThemeContext
│   │   ├── hooks/                             # Custom hooks (useAuth, useLanguage, useNotification)
│   │   ├── i18n/                              # Trilingual translation dictionaries (EN, SI, TA)
│   │   ├── pages/                             # Core Application & Portal Pages
│   │   │   ├── LandingPage.jsx                # Public Hero, Features, Seettu FAQ & Legal Modals
│   │   │   ├── Dashboard.jsx                  # Analytics, quick actions, cycle progress
│   │   │   ├── MyGroups.jsx / CreateGroup.jsx # Group creation, browsing, member enrollment
│   │   │   ├── GroupDetail.jsx                # Circle cycle tracking, auctions, emergency payouts
│   │   │   ├── PaymentTracking.jsx            # Contribution verification, status updates, reminder triggers
│   │   │   ├── AdvancePayments.jsx            # Advance fund deposits and rollover tracking
│   │   │   ├── Notifications.jsx              # Unread filter, batch mark-read, system-wide activity
│   │   │   ├── Disputes.jsx                   # Formal dispute ticketing and resolution
│   │   │   ├── Certificates.jsx               # Verifiable digital certificate generation
│   │   │   ├── Members.jsx                    # User KYC verification & organizer approval queue
│   │   │   └── Profile.jsx                    # User identity, discipline score, password settings
│   │   ├── App.jsx                            # Master route definitions and protected route wrappers
│   │   └── main.jsx                           # Application bootstrap
│   ├── package.json                           # NPM dependencies
│   └── vite.config.js                         # Vite dev server configuration (Port 5173)
│
├── database/                                  # Database Architecture Scripts
│   ├── Schema.sql                             # Complete DDL script with all 18 normalized tables
│   └── Seed.sql                               # Initial test seed records and demo groups
│
└── README.md                                  # Complete Project Documentation
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
Before running the project locally, ensure you have installed:
* **Java Development Kit (JDK) 17+** (`java -version`)
* **Apache Maven 3.8+** (`mvn -version`)
* **Node.js 18+ and npm** (`node -v` / `npm -v`)
* **MySQL Server 8.0+** (`mysql -u root -p`)

---

### Step 1: Database Initialization
1. Log in to your MySQL server:
   ```bash
   mysql -u root -p
   ```
2. Create the database and run the schema and seed scripts:
   ```sql
   CREATE DATABASE seettu_manager;
   USE seettu_manager;
   SOURCE database/Schema.sql;
   SOURCE database/Seed.sql;
   ```

---

### Step 2: Backend Configuration & Startup
1. Open [`backend/src/main/resources/application.properties`](backend/src/main/resources/application.properties) and verify your MySQL connection settings:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/seettu_manager?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   server.port=8081
   ```
2. Build and launch the Spring Boot application:
   ```bash
   cd backend
   mvn clean compile
   mvn spring-boot:run
   ```
   *The backend REST API will start listening at `http://localhost:8081`.*

---

### Step 3: Frontend Setup & Startup
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   npm install
   ```
2. Launch the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   👉 **`http://localhost:5173`**

---

### Default Test Credentials

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@seetumanager.com` | `Admin@123` | Full administrative oversight, KYC & Organizer approvals, system notifications |
| **Group Organizer** | `reeha@gmail.com` | *(Password set via portal)* | Circle creation, cycle scheduling, slip approval, reminder dispatching |
| **Group Member** | `jone@example.com` | *(Registered user)* | Group participation, slip upload, bidding, certificate download |

---

## 📡 Core REST API Reference

| Domain | Method | Endpoint | Description | Access Level |
| :--- | :---: | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/auth/register` | Register new member account | Public |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user and return JWT | Public |
| **Auth** | `POST` | `/api/auth/apply-organizer` | Submit application to become an Organizer | Public |
| **Groups** | `GET` | `/api/groups` | Retrieve all public Seettu groups | Authenticated |
| **Groups** | `POST` | `/api/groups` | Create a new monetary or asset group | Organizer / Admin |
| **Groups** | `GET` | `/api/groups/{id}` | Get group details, cycles, and members | Authenticated |
| **Cycles** | `GET` | `/api/payment-cycles/group/{groupId}` | Get rotation cycle schedule | Authenticated |
| **Payments** | `POST` | `/api/payments` | Record member installment contribution | Member / Organizer |
| **Payments** | `POST` | `/api/payments/{id}/evidence` | Upload bank deposit receipt slip | Authenticated |
| **Payments** | `POST` | `/api/payments/send-reminders` | Trigger automated upcoming cycle reminders | Organizer / Admin |
| **Notifications** | `GET` | `/api/notifications/user/{userId}` | Get personal notifications | Authenticated |
| **Notifications** | `GET` | `/api/notifications/user/{userId}/unread-count` | Get unread notification counter | Authenticated |
| **Notifications** | `PUT` | `/api/notifications/{id}/read` | Mark individual notification as read | Authenticated |
| **Notifications** | `PUT` | `/api/notifications/user/{userId}/read-all` | Batch mark all notifications as read | Authenticated |
| **Disputes** | `POST` | `/api/disputes` | Submit formal transaction dispute ticket | Authenticated |
| **Disputes** | `PUT` | `/api/disputes/{id}/status` | Resolve or escalate dispute | Organizer / Admin |
| **Chatbot** | `POST` | `/api/chatbot/query` | Query rule-based Seettu FAQ Assistant | Public / Auth |
| **Certificates** | `POST` | `/api/certificates` | Generate verifiable discipline certificate | Member / Admin |
| **Users** | `PUT` | `/api/users/{id}/kyc/verify` | Verify identity & Grama Niladhari certificate | Admin |

---

## ⚖️ Legal Alignment & Compliance

SeettuManager is designed in strict compliance with the statutory legal framework of Sri Lanka:
* **The Cheetus Ordinance No. 61 of 1935 (Chapter 190):** Adheres to statutory requirements regarding formation agreements, record transparency, and subscriber protection.
* **Cheetus (Amendment) Act No. 55 of 1980:** Supports sanctioned bidding, discount dividend distribution, and dispute arbitration procedures.
* **Personal Data Protection Act No. 9 of 2022 (PDPA):** Guarantees privacy, secure tokenization, and strict access controls over user financial data.
* **National Identity Verification:** Mitigates financial identity theft through 9-digit (V/X) and 12-digit Sri Lankan NIC validation.
* **Residency Character Certification:** Enforces Grama Niladhari certificate verification before organizers can launch public capital circles.

---

## 📄 License & Academic Declaration

This project is developed as the **Final Capstone Project** for the **National Diploma in Technology (NDT) in Information Technology** at the **Institute of Technology, University of Moratuwa (ITUM)**, Sri Lanka.

All intellectual rights belong to the project team and ITUM.  
*Academic Use Only — SeettuManager © 2026 Group 15.*
