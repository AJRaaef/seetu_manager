# SeettuManager

> **A Digital Financial Discipline System for Rotating Savings Groups in Sri Lanka**  
> **National Diploma in Technology (NDT) in Information Technology — Final Capstone Project**  
> **Division of Information Technology, Institute of Technology, University of Moratuwa (ITUM)**  
> **Supervised by:** W.M.N. Wathsala Bandara Manike  

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-Academic-blue?style=for-the-badge)]()

---

## 📌 1. Introduction & Product Scope

### 1.1 Purpose
**SeettuManager** is a secure, mobile-responsive web platform designed to digitize, modernize, and streamline the administration of traditional Rotating Savings and Credit Associations (ROSCAs), universally known across Sri Lanka as **Seettu (සීට්ටු / சீட்டு)**.

Traditional Seettu circles represent an essential grassroots financial lifeline for micro-entrepreneurs, rural self-help groups, and community members who lack formal bank collateral. However, traditional manual management suffers from handwritten paper ledger errors, lack of transparency, record loss, and payment default flight risks.

### 1.2 Aim & Objectives (SRS Section 1.2.1)
* **Project Aim:**  
  To design and develop a web-based and mobile-responsive digital platform, **SeettuManager**, that revolutionizes the management of Seettu groups in Sri Lanka, ensuring transparency, accountability, financial discipline, and trust among members, while retaining the traditional community structure of these informal savings systems.

* **Main Objectives:**
  1. Analyze current Seettu management processes and identify operational inefficiencies in manual record-keeping.
  2. Design and develop a secure, scalable web-based platform with trilingual accessibility (**English**, **Sinhala**, and **Tamil**).
  3. Implement automated payment tracking, receipt verification, and algorithmic **Financial Discipline Scoring ($0–100$)**.
  4. Provide structured two-tier dispute management, risk detection, and audit trail mechanisms.
  5. Test, validate, and refine the system for production readiness.

### 1.3 Project Boundaries (SRS Section 1.2.2 & SAFE-01)
* **Geographical Boundary:** Designed for Seettu groups in Sri Lanka with native trilingual support (English, Sinhala, and Tamil).
* **User Boundary:** Serves three distinct roles: **System Administrators**, **Group Organizers**, and **Group Members**.
* **Functional Boundary:** Manages group formation, cycle scheduling, member management, payment tracking, discipline scoring, dispute resolution, PDF reports, digital participation certificates, and an embedded FAQ chatbot assistant.
* **Non-Custodial Financial Boundary (SAFE-01):** The system **does NOT directly handle, transfer, or store actual financial funds**. All monetary contributions occur offline (cash or direct bank transfer); SeettuManager functions strictly as the tamper-proof digital validator, scheduler, and credit auditor.

---

## 🏗️ 2. System Architecture (SRS Section 2.1)

SeettuManager follows a decoupled **3-Tier Client-Server Architecture** model:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                    1. PRESENTATION TIER (FRONTEND)                     │
 │          React 18.x  •  Vite 5.x  •  Bootstrap 5  •  Lucide Icons      │
 │    Trilingual Context (EN / SI / TA)  •  Mobile-First Responsive UI    │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ Secure JSON via HTTP/HTTPS REST APIs
 ┌───────────────────────────────────▼────────────────────────────────────┐
 │                  2. BUSINESS LOGIC TIER (BACKEND)                      │
 │           Spring Boot 3.2.x (Java 17)  •  Spring Security              │
 │  • JWT Stateless Authentication   • Role-Based Access Control (RBAC)   │
 │  • Seettu Cycle Scheduler Engine  • Payment Verification Engine        │
 │  • Financial Discipline Algorithm • Two-Tier Dispute Arbitrator        │
 │  • Embedded Rule-Based Chatbot    • Scheduled Tasks (Daily Cron)       │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ JDBC / JPA Hibernate ORM
 ┌───────────────────────────────────▼────────────────────────────────────┐
 │                       3. DATA TIER (STORAGE)                           │
 │             MySQL 8.0+ Relational Database (18 Normalized Tables)      │
 │   users, groups, group_members, payment_cycles, payments,             │
 │   advance_payments, notifications, disputes, faqs, audit_logs...       │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ 3. Core System Features (SRS Section 5)

### 3.1 User Authentication and Role Management (SRS Feature 1)
* **Registration & Validation (REQ-AUTH-01, 02):** Validates full name, email address, phone number, and preferred language.
* **Cryptographic Security (REQ-AUTH-03, SEC-01):** Hashes all passwords using **BCrypt** (cost factor $\ge 10$).
* **Stateless JWT Tokens (REQ-AUTH-05, SEC-03):** Issues JSON Web Tokens (JWT) with 24-hour expiration.
* **Role-Based Access Control (REQ-AUTH-06, 07):** Granular access enforcement across three roles:
  * **System Administrator:** Platform oversight, user account control, audit log review, and escalated dispute arbitration.
  * **Group Organizer:** Group creation and configuration, member management, payment recording, and dispute review.
  * **Group Member:** Cycle participation, personal payment tracking, slip upload, discipline score review, and dispute filing.
* **Account Lockout Protection (REQ-AUTH-10, SEC-06):** Automatically locks accounts after 5 consecutive failed login attempts.

### 3.2 Group and Member Management (SRS Feature 2)
* **Multi-Model Seettu Groups (REQ-GRP-01, 09):**
  * **Fixed Rotation Seettu:** Predetermined rotational payout queue.
  * **Auction / Bidding Seettu:** Competitive discount bidding with dividend distribution.
  * **Random Draw / Lottery:** Neutral algorithmic lot selection.
  * **Non-Monetary Asset Seettu:** Rotation pools for high-value physical goods (appliances, equipment, jewelry).
* **Automated Cycle Scheduling (REQ-GRP-02):** Automatically generates payout schedules based on member count and contribution frequency (daily, weekly, monthly).
* **Participation History (REQ-GRP-05):** Maintains comprehensive historical logs of join dates, exits, and cycle turns.

### 3.3 Payment Tracking and Cycle Management (SRS Feature 3)
* **Lifecycle Status Tracking (REQ-PAY-01, 05, 06):**
  * `PAID`: Validated on-time installment contribution.
  * `PENDING`: Scheduled upcoming payment.
  * `LATE`: Contribution recorded after the scheduled due date.
  * `OVERDUE`: Automatically flagged if unpaid 7 days after the due date.
* **Bank Deposit Slip Uploads:** Members attach digital payment receipts (`.png`, `.jpg`, `.pdf`) for organizer verification.
* **Double-Payment Prevention (REQ-PAY-04):** Composite database constraints (`cycle_id` + `member_id`) enforce financial ledger integrity.
* **Advance Payments Ledger:** Support for advance contribution deposits and automatic rollover reconciliations for upcoming cycles.
* **Immutable Audit Trail (REQ-PAY-08, SAFE-03):** Every payment action records timestamp, recorder ID, and transaction details into `audit_logs`.

### 3.4 Financial Discipline Scoring (SRS Feature 4)
Calculates an objective mathematical creditworthiness metric for each member based on repayment timeliness:

$$\text{Score} = \max\left(0,\, 100 - \left[(\text{Late Payments} \times 5) + (\text{Missed Payments} \times 10) + (\text{AvgDelayDays} \times 0.5)\right]\right)$$

* **5 Reliability Categories (REQ-SCR-03):**
  * **$90 – 100$ (Excellent):** Prompt contributor; eligible for priority payout allocations and lowest guarantor requirements.
  * **$75 – 89$ (Good):** Reliable standing; standard circle eligibility.
  * **$60 – 74$ (Fair):** Average reliability; guarantor required for early payout rounds.
  * **$40 – 59$ (Poor):** Irregular contributor; subject to organizer monitoring.
  * **$0 – 39$ (High Risk):** Default risk (REQ-SCR-06); flagged for organizer oversight and circle restrictions.

### 3.5 Dispute Management (SRS Feature 5)
* **Two-Tier Structured Arbitration (REQ-DSP-01 to 07):**
  * **Tier 1 (Group Level):** Group Organizer reviews member dispute submissions with evidence attachments and enters resolution notes.
  * **Tier 2 (Platform Level):** Contested or unresolved disputes are escalated to System Administrators for final arbitration.
* **Dispute Lifecycle (REQ-DSP-03, 05):** Unique Dispute Reference ID tracking across states: `OPEN` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `RESOLVED` / `REJECTED`.
* **Emergency Relief Fund:** Verified members experiencing acute financial distress can apply for prioritized liquidity from the group reserve.

### 3.6 Report and Certificate Generation (SRS Feature 6)
* **Automated PDF Reports (REQ-RPT-01, 02):** Generates printable PDF statements for member payment histories, group collection summaries, and performance analytics via iText.
* **Verifiable Digital Participation Certificates (REQ-RPT-04, 05):** Automatically issued to members completing full Seettu cycles, featuring a cryptographic Unique Certificate ID (e.g., `SL-CERT-XXXXX`).
* **Data Export Utility (REQ-RPT-07):** Supports CSV export of financial histories for offline record-keeping.

### 3.7 Rule-Based Seettu FAQ Chatbot Assistant (SRS Feature 7)
* **Embedded Architecture (REQ-CHAT-01, 08):** Self-contained, collapsible assistant running locally without external third-party services (Constraint 2.4).
* **Deterministic Token Scoring & FAQ Store (REQ-CHAT-02, 07):** Matches user inquiries against database FAQs (`faqs` table) with keyword-scoring algorithms.
* **Pre-Programmed Task Guidance:**
  * How to record payments and upload bank deposit slips (REQ-CHAT-05).
  * Upcoming cycle payment due date inquiries (REQ-CHAT-03).
  * Discipline score formula and tier explanations (REQ-CHAT-04).
  * Statutory *Cheetus Ordinance No. 61 of 1935* compliance and member exit/refund rules.
  * Support desk contacts and branch details.

---

## 🛠️ 4. Technology Stack & Operating Environment (SRS Section 2.3 & 2.4)

| Layer / Component | Technology | Specification / Role |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.x | Vite 5 build tool, React Router DOM 6, React Bootstrap 5 |
| **Iconography** | Lucide React | Clean vector line-art SVG icons (`<Icon />`) |
| **Backend Framework** | Spring Boot 3.2.x | Java 17, Spring Data JPA, Hibernate 6 ORM, Lombok |
| **Security & Auth** | Spring Security & JWT | `jjwt-api 0.11.5`, BCrypt Password Hashing, Stateless RBAC |
| **Database** | MySQL 8.0+ | 18 normalized relational tables, HikariCP Connection Pool |
| **Task Engine** | Spring Scheduling | `@Scheduled` Cron: 9:00 AM payment reminders, midnight overdue checks |
| **Reporting / Media** | iText PDF & File I/O | PDF statement generation, secure slip uploads (`./uploads`) |
| **Localization (I18n)** | Custom React Context | English, Sinhala (සිංහල), and Tamil (தமிழ்) (REQ-ACC-01) |

### Operating Environment
* **Server Requirements:** Java Runtime Environment (JRE) 17+, MySQL Server 8.0+, embedded Tomcat server (Min 4GB RAM).
* **Client Requirements:** Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) on desktop, tablet, or smartphone (responsive down to 320px).

---

## 📁 5. Repository Directory Structure

```
seetu_manager/
├── backend/                                   # Spring Boot Enterprise Application
│   ├── src/main/java/com/seettu/manager/
│   │   ├── config/                            # Security, CORS, WebMvc configuration
│   │   ├── controller/                        # REST Controllers (Auth, Groups, Payments, Notifications...)
│   │   ├── dto/                               # Request/Response Data Transfer Objects
│   │   ├── entity/                            # JPA Entities (User, Group, Payment, PaymentCycle...)
│   │   ├── exception/                         # Global Exception Handler
│   │   ├── repository/                        # Spring Data JPA Repositories
│   │   ├── security/                          # JWT Token Filters, UserDetailsService
│   │   ├── service/                           # Business logic (PaymentService, ChatbotService...)
│   │   └── util/                              # ScheduledTasks, AuditLogService
│   ├── src/main/resources/
│   │   └── application.properties             # Database credentials, JWT Secret, Server Port 8081
│   ├── uploads/                               # Bank deposit slips and identity documents
│   └── pom.xml                                # Maven dependencies
│
├── frontend/                                  # React.js Single Page Application
│   ├── public/                                # Favicons, logos, showcase graphics
│   ├── src/
│   │   ├── api/                               # Axios API service clients (paymentApi, chatbotApi...)
│   │   ├── components/                        # UI widgets (Topbar, Sidebar, Icons, ChatbotWidget...)
│   │   ├── contexts/                          # AuthContext, LanguageContext, ThemeContext
│   │   ├── hooks/                             # Custom hooks (useAuth, useLanguage, useNotification)
│   │   ├── i18n/                              # Trilingual translation dictionaries (EN, SI, TA)
│   │   ├── pages/                             # Core Application Views
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
│   │   ├── App.jsx                            # Master route definitions
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

## 🚀 6. Getting Started & Local Setup

### Prerequisites
* **Java Development Kit (JDK) 17+** (`java -version`)
* **Apache Maven 3.8+** (`mvn -version`)
* **Node.js 18+ and npm** (`node -v` / `npm -v`)
* **MySQL Server 8.0+** (`mysql -u root -p`)

---

### Step 1: Database Initialization
1. Log in to your local MySQL CLI:
   ```bash
   mysql -u root -p
   ```
2. Create the database and execute the schema and seed scripts:
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
2. Build and launch the Spring Boot server:
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
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   👉 **`http://localhost:5173`**

---

### Default Test Credentials

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@seetumanager.com` | `Admin@123` | Platform oversight, user account management, escalated disputes |
| **Group Organizer** | `reeha@gmail.com` | *(Registered password)* | Circle creation, cycle management, slip verification, reminders |
| **Group Member** | `jone@example.com` | *(Registered password)* | Circle participation, payment slip uploads, score review, certificates |

---

## 📡 7. Core REST API Reference

| Domain | Method | Endpoint | Description | Access Level |
| :--- | :---: | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/auth/register` | Register new user account | Public |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user and issue 24-hr JWT | Public |
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
| **Disputes** | `PUT` | `/api/disputes/{id}/status` | Resolve or escalate dispute status | Organizer / Admin |
| **Chatbot** | `POST` | `/api/chatbot/query` | Query rule-based Seettu FAQ Assistant | Public / Auth |
| **Certificates** | `POST` | `/api/certificates` | Generate verifiable discipline certificate | Member / Admin |
| **Users** | `PUT` | `/api/users/{id}/kyc/verify` | Verify identity & Grama Niladhari certificate | Admin |

---

## 👥 8. Project Team & Academic Information

This project is developed as the **Final Capstone Project** for the **National Diploma in Technology (NDT) in Information Technology** at the **Institute of Technology, University of Moratuwa (ITUM)**, Sri Lanka.

* **Academic Department:** Division of Information Technology, ITUM  
* **Project Title:** SeettuManager: A Digital Financial Discipline System for Rotating Savings Groups in Sri Lanka  
* **Project Supervisor:** W.M.N. Wathsala Bandara Manike  
* **Academic Year:** 2026  

### Group 15 Members

| Member Name | Index Number | Primary Role | GitHub Profile |
| :--- | :---: | :--- | :--- |
| **A.J. Raaef** *(Leader)* | `23IT0516` | System Architecture, Security & Backend Lead | [@AJRaaef](https://github.com/AJRaaef) |
| **M.R. Hanan** | `23IT0480` | Database Design, Seettu Cycle & Payment UI Lead | [@reezmahanan](https://github.com/reezmahanan) |
| **B.A.P. Nethmi** | `23IT0509` | React Frontend, Group & Member Management Lead | [@PamodyaNethmi](https://github.com/PamodyaNethmi) |
| **M.A. Hamas** | `23IT0479` | Financial Discipline, Risk Analytics & Certificates Lead | [@HamasAkram03](https://github.com/HamasAkram03) |
| **N.M. Asrar** | `23IT0456` | Dispute Management, Notifications & Testing Lead | [@asrarDev-tech](https://github.com/asrarDev-tech) |
| **W.V. Shashiprabha** | `23IT0535` | Multi-Language, Audit Trail, FAQ Chatbot & Documentation Lead | [@Vichakshi-Shashiprabha](https://github.com/Vichakshi-Shashiprabha) |

---

## ⚖️ 9. Legal Alignment & Compliance

* **The Cheetus Ordinance No. 61 of 1935 (Chapter 190):** Adheres to statutory requirements regarding formation agreements, record transparency, and subscriber protection.
* **Cheetus (Amendment) Act No. 55 of 1980:** Supports sanctioned bidding, discount dividend distribution, and statutory dispute arbitration procedures.
* **Personal Data Protection Act No. 9 of 2022 (PDPA):** Enforces data privacy, secure tokenization, and strict access controls over user financial data.
* **National Identity Verification:** Mitigates financial identity theft through 9-digit (V/X) and 12-digit Sri Lankan NIC validation.
* **Residency Character Certification:** Enforces Grama Niladhari certificate verification before organizers can launch public capital circles.

---

## 📄 10. Academic Declaration & References

### References (SRS Section 7)
1. **J. Ardener**, "The comparative study of rotating credit associations," *Journal of the Royal Anthropological Institute*, 1964.
2. **F. J. A. Bouman**, "Rotating and accumulating savings and credit associations: A development perspective," *World Development*, vol. 23, no. 3, pp. 371–384, 1995.
3. **M. Rutherford**, *The Poor and Their Money*. Oxford, U.K.: Oxford University Press, 2000.
4. **T. Besley, S. Coate, and G. Loury**, "Rotating savings and credit associations, credit markets and efficiency," *The Review of Economic Studies*, vol. 61, no. 4, pp. 701–719, 1994.
5. **S. Anderson and J.-M. Baland**, "The economics of rotating savings and credit associations," *The Quarterly Journal of Economics*, vol. 117, no. 3, pp. 963–995, 2002.
6. **S. Klonner**, "Rotating savings and credit associations as insurance," *Econometric Society*, 2000.
7. **R. Abebe et al.**, "An algorithmic introduction to savings circles," *arXiv preprint*, 2022.

---

*Academic Use Only — SeettuManager © 2026 Group 15, ITUM.*
