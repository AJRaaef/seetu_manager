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

**SeettuManager** is an enterprise-grade, mobile-responsive web application designed to digitize, secure, and modernize traditional Rotating Savings and Credit Associations (ROSCAs), universally recognized across Sri Lanka as **Seettu (සීට්ටු / சீட்டு)**.

Traditional Seettu circles are a critical grassroots financial lifeline for micro-entrepreneurs, village communities, and salaried employees who lack conventional bank collateral. However, traditional circles suffer from handwritten paper ledger errors, lack of transparency, record loss, and default flight risks.

**SeettuManager** resolves these challenges by introducing a **non-custodial digital ledger**:
- Contributions occur offline or via direct bank transfer, preserving community trust.
- The platform functions as the tamper-proof digital validator, cycle scheduler, and credit auditor.
- Evaluates individual repayment trustworthiness using an automated algorithmic **Financial Discipline Score ($0–100$)**.
- Protects members through bank slip evidence verification, emergency relief mechanisms, and structured dispute arbitration in alignment with *The Cheetus Ordinance No. 61 of 1935*.

---

## ✨ Key Capabilities & Features

### 1. Multi-Model Seettu Group Management
* **Fixed Rotational Seettu:** Automated turn allocation based on predetermined member queues.
* **Auction & Bidding Seettu:** Competitive discount bidding during cycle windows, automatically recalculating member dividends to lower out-of-pocket installments.
* **Random Draw / Lottery Seettu:** Neutral algorithmic selection for fair community turns.
* **Non-Monetary Asset Seettu:** Manage high-value rotation pools for physical assets (sovereign gold jewelry, machinery, vehicles) with certified valuation entries.

### 2. Comprehensive Payment Tracking & Evidence Verification
* **Lifecycle Status Tracking:** Contributions classified in real time as `PAID`, `PENDING`, `PARTIAL`, `LATE`, or `OVERDUE`.
* **Bank Deposit Slip Uploads:** Members attach digital payment receipts (`.png`, `.jpg`, `.pdf`) for organizer verification.
* **Advance Payments Ledger:** Support for advance contribution deposits and rollover reconciliations.
* **Double-Payment Prevention:** Database-level composite constraints (`cycle_id` + `member_id`) ensure financial ledger integrity.

### 3. Algorithmic Financial Discipline Scoring ($0–100$)
An objective mathematical credit metric designed to evaluate member reliability without invasive banking bureaucracy:
$$\text{Discipline Score} = \max\left(0,\, 100 - \left[(\text{Late Payments} \times 5) + (\text{Missed Payments} \times 10) + (\text{Average Delay Days} \times 0.5)\right]\right)$$

* **Score Tiers:**
  * **$80 – 100$ (Excellent):** Prompt contributor; eligible for early payout allocations and high-capital circles.
  * **$65 – 79$ (Good):** Reliable standing with minor isolated delays.
  * **$50 – 64$ (Moderate):** Monitored standing; restricted from high-stakes bidding.
  * **$< 50$ (High-Risk):** Default risk; flagged for organizer oversight and circle restrictions.

### 4. Real-Time Notification Center & Multi-Channel Reminders
* **Automated Daily Schedulers:**
  * **9:00 AM Cron:** Scans active cycles due within 7 days and dispatches automated payment reminders.
  * **Midnight Cron:** Flags overdue payments past the 7-day cutoff and updates discipline penalties.
* **Multi-Channel Dispatch:**
  * **In-App:** Live unread bell badge, category chips, and batch "Mark All Read" functionality.
  * **WhatsApp:** Instant one-click Click-to-Chat generation with international phone encoding (`+94`) and pre-filled message previews.
  * **SMS:** Native device messaging protocols and telecom gateway endpoints.
  * **Admin/Organizer View Mode:** Seamless toggle between personal inbox and system-wide activity logs.

### 5. Multi-Level Dispute Resolution & Emergency Relief
* **Structured Arbitration:** Members submit formal dispute tickets with file attachments; organizers review internally or escalate to System Administrators.
* **Emergency Relief Reserve:** Verified members facing unexpected crises can request prioritized liquidity or temporary contribution relief from the group pool.

### 6. Digital Certificates & PDF Financial Reporting
* **Verifiable Discipline Certificates:** Cryptographically verified completion certificates featuring unique IDs (e.g., `SL-CERT-XXXXX`).
* **Instant Financial Statements:** Exportable PDF summaries, circle collection records, and CSV audit reports.

### 7. Trilingual Localization & AI Assistant
* **Instant Language Switching:** Fully localized in **English**, **සිංහල (Sinhala)**, and **தமிழ் (Tamil)** without page reloads.
* **Interactive Seettu Assistant:** Built-in contextual chatbot providing statutory Cheetus Ordinance guidance, cycle due date lookups, and troubleshooting.

---

## 👥 Project Team & Contributions

Developed by **Group 15** — National Diploma in Technology (IT), Institute of Technology, University of Moratuwa:

| Member Name | Index Number | Primary Role & Core Modules | GitHub |
| :--- | :---: | :--- | :--- |
| **A.J. Raaef** *(Leader)* | `23IT0516` | **System Architecture & Backend Lead**<br>Three-Tier architecture, Spring Boot 3 structure, JWT stateless authentication, Role-Based Access Control (RBAC), password recovery, and security filters. | [@AJRaaef](https://github.com/AJRaaef) |
| **M.R. Hanan** | `23IT0480` | **Database Design & Payment Tracking Lead**<br>18 normalized MySQL tables, JPA entity mappings, Seettu cycle engine, payment status lifecycle (`PAID`/`PENDING`/`OVERDUE`), advance payments, and receipt modal views. | [@reezmahanan](https://github.com/reezmahanan) |
| **B.A.P. Nethmi** | `23IT0509` | **Frontend Architecture & Group Management**<br>React SPA foundation, responsive AppLayout (Topbar & Sidebar), group creation wizards, member onboarding portals, and cross-device mobile navigation. | [@PamodyaNethmi](https://github.com/PamodyaNethmi) |
| **M.A. Hamas** | `23IT0479` | **Discipline Scoring, Analytics & Certificates**<br>Algorithmic Financial Discipline Score calculation ($0–100$), risk level detection, group statistics, iText PDF report generation, and digital certificate verification. | [@HamasAkram03](https://github.com/HamasAkram03) |
| **N.M. Asrar** | `23IT0456` | **Dispute Resolution & Notification Subsystem**<br>Two-tier dispute arbitration workflow, real-time in-app notification engine, batch read APIs, reminder schedulers, and end-to-end integration testing. | [@asrarDev-tech](https://github.com/asrarDev-tech) |
| **W.V. Shashiprabha** | `23IT0535` | **Localization, Audit Trail & Documentation**<br>Trilingual internationalization (EN/SI/TA) engine, immutable security audit logging (`audit_logs`), interactive Chatbot assistant, and system user manuals. | [@Vichakshi-Shashiprabha](https://github.com/Vichakshi-Shashiprabha) |

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
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ JPA / Hibernate ORM
 ┌───────────────────────────────────▼────────────────────────────────────┐
 │                         DATA TIER (STORAGE)                            │
 │             MySQL 8.0+ Relational Database (18 Core Tables)            │
 │   users, groups, group_members, payment_cycles, payments,             │
 │   advance_payments, notifications, disputes, audit_logs...             │
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
| **Document/Media** | PDF & File Storage | iText PDF Generation, Multi-Part File Uploads (`./uploads`) |

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
│   │   ├── service/                           # Business logic (PaymentService, NotificationService...)
│   │   └── util/                              # ScheduledTasks, AuditLogService
│   ├── src/main/resources/
│   │   └── application.properties             # Database credentials, JWT Secret, Server Port 8081
│   ├── uploads/                               # Stored bank slips and identity certificates
│   └── pom.xml                                # Maven build specification
│
├── frontend/                                  # React.js Single Page Application
│   ├── public/                                # Favicons, logos, showcase images
│   ├── src/
│   │   ├── api/                               # Axios API service integrations
│   │   ├── components/                        # Reusable UI widgets (Navbar, Topbar, Sidebar, Modals...)
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
2. Create the database and run the schema script:
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
| **Certificates** | `POST` | `/api/certificates` | Generate verifiable discipline certificate | Member / Admin |
| **Users** | `PUT` | `/api/users/{id}/kyc/verify` | Verify identity & Grama Niladhari certificate | Admin |

---

## ⚖️ Legal Alignment & Compliance

SeettuManager is designed in strict compliance with the statutory legal framework of Sri Lanka:
* **The Cheetus Ordinance No. 61 of 1935:** Adheres to statutory requirements regarding formation agreements, record transparency, and subscriber protection.
* **National Identity Verification:** Mitigates financial identity theft through 9-digit (V/X) and 12-digit Sri Lankan NIC validation.
* **Residency Character Certification:** Enforces Grama Niladhari certificate verification before organizers can launch public capital circles.

---

## 📄 License & Academic Declaration

This project is developed as the **Final Capstone Project** for the **National Diploma in Technology (NDT) in Information Technology** at the **Institute of Technology, University of Moratuwa (ITUM)**, Sri Lanka.

All intellectual rights belong to the project team and ITUM.
*Academic Use Only — SeettuManager © 2026 Group 15.*
