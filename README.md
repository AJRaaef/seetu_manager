# SeettuManager

> **A Digital Financial Discipline System for Rotating Savings Groups in Sri Lanka**  
> **National Diploma in Information Technology (NDT IT) — Final Project**  
> **Institute of Technology, University of Moratuwa (ITUM)**

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2-purple.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-Academic-lightgrey.svg)]()

---

## 📖 Project Overview

**SeettuManager** is a web-based, mobile-responsive financial discipline platform engineered to modernize traditional rotating savings and credit associations (*Seettu / ROSCAs*) in Sri Lanka. The platform replaces paper-based, manual record-keeping with a secure, transparent, trilingual digital ecosystem that automates cycle scheduling, tracks offline and bank contributions, mitigates default risks, and evaluates member creditworthiness via an algorithmic **Financial Discipline Score**.

### Key System Capabilities:
- **Role-Based Access Control (RBAC):** Admin, Organizer, and Member roles with stateless JWT authentication.
- **Seettu Cycle Automation:** Rotational payout scheduling, bidding, and automated daily cycle tracking.
- **Real-Time Payment Tracking:** Recording offline cash/bank transfers, payment audit trails, and overdue notifications.
- **Algorithmic Financial Discipline Scoring:** Automated credit scoring ($\text{Score} \in [0, 100]$) and high-risk member detection.
- **Dispute Resolution & Escalation:** Transparent dispute ticket management with multi-level review.
- **Trilingual Accessibility:** Native support for **English**, **සිංහල (Sinhala)**, and **தமிழ் (Tamil)** as per SRS REQ-ACC-01.
- **Analytics & Digital Certificates:** PDF audit reports and completion certificates upon successful cycle execution.

---

## 👥 Project Team & Contact Information

| Member Name | Index Number | Role | Email | GitHub |
| :--- | :---: | :--- | :--- | :--- |
| **A.J. Raaef** *(Leader)* | `23IT0516` | System Architecture, Security & Backend Lead | — | [@AJRaaef](https://github.com/AJRaaef) |
| **M.R. Hanan** | `23IT0480` | Database Design, Seettu Cycle & Payment UI | `reezmahanan@gmail.com` | [@reezmahanan](https://github.com/reezmahanan) |
| **B.A.P. Nethmi** | `23IT0509` | React Frontend, Group & Member Management | `pamodyanethmi2002@gmail.com` | [@PamodyaNethmi](https://github.com/PamodyaNethmi) |
| **M.A. Hamas** | `23IT0479` | Financial Discipline, Risk Analytics & Reports | — | [@HamasAkram03](https://github.com/HamasAkram03) |
| **N.M. Asrar** | `23IT0456` | Dispute Management, Notifications & Testing | — | [@asrarDev-tech](https://github.com/asrarDev-tech) |
| **W.V. Shashiprabha** | `23IT0535` | Multi-Language, Audit Trail, Chatbot & Docs | `vichakshi245@gmail.com` | [@Vichakshi-Shashiprabha](https://github.com/Vichakshi-Shashiprabha) |

---

## 📋 Final Project Work Allocation & Deliverables

### 1. A.J. Raaef — System Architecture, Authentication, Authorization & Security
* **Assigned Work:**
  * System Architecture and 3-Tier Architecture design
  * Spring Boot Backend structure and configuration
  * User Registration and Login endpoints
  * JWT Authentication (stateless token generation & validation)
  * Role-Based Access Control (RBAC) for Admin, Organizer, and Member roles
  * Password Management and Forgot Password workflows
  * Account Locking and Login Security safeguards
  * Backend Security filters and Protected API routes
  * Input Validation and Secure API error handling
  * Authentication and Security testing
* **Main Deliverables:**
  * System architecture diagrams and specifications
  * Authentication module (`/api/auth/**`)
  * Authorization / RBAC module
  * Security implementation (`SecurityConfig.java`, JWT filters)
  * Secure REST APIs
  * Authentication and security documentation

---

### 2. M.R. Hanan — Database, Seettu Cycle, Payment Tracking & Payment Management UI
* **Assigned Work:**
  * **Database & Backend:**
    * MySQL Database Design (18 normalized relational tables)
    * Database Tables, Primary/Foreign Keys, and Indexing
    * Entity Relationship (ER) diagram design
    * JPA / Hibernate Entity Mapping
    * Seettu Group Cycle Management (`PaymentCycleService.java`)
    * Contribution and Payout Schedule Management
    * Payment Recording and Tracking (`PaymentService.java`)
    * Payment Status Management (`PAID`, `PENDING`, `LATE`, `OVERDUE`)
    * Partial payment handling and duplicate payment prevention
    * Fixed and variable contribution calculation rules
    * Payment audit information and database transaction integrity
    * Scheduled daily overdue evaluation (`PaymentScheduler.java`)
  * **Frontend — Payment-Related UI:**
    * Master Payment Management Interface (`PaymentManagement.jsx`)
    * Quick Payment Recording Form (`PaymentRecordForm.jsx`)
    * Payment History Table with live actions (`PaymentHistoryTable.jsx`)
    * Payment Details View Modal with Receipt Printing (`PaymentDetailsModal.jsx`)
    * Color-coded Payment Status Badges (`PaymentStatusBadge.jsx`)
    * Statistical Summary Cards with Progress Bars (`PaymentSummaryCards.jsx`)
    * Payment-related form validation and live search filtering
    * Payment REST API Integration service (`paymentApi.js`)
    * Responsive, accessible layout adhering to SRS Figures 4 & 20
* **Main Deliverables:**
  * MySQL database schema (`database/Schema.sql`) & seeds (`database/Seed.sql`)
  * Entity relationship model & JPA entity definitions
  * Seettu cycle management module (`/api/payment-cycles/**`)
  * Payment tracking backend module (`/api/payments/**`)
  * Payment management frontend screens & modals
  * Payment REST API integration
  * Database documentation and dictionary

---

### 3. B.A.P. Nethmi — React Frontend, Group & Member Management
* **Assigned Work:**
  * **Frontend Structure & General UI:**
    * React.js Frontend structure and Vite setup
    * Overall responsive user interface design
    * Common UI components, top navigation, and sidebar layouts
    * Login and User Registration interfaces
    * Group Management Interface
    * Group Creation and Configuration forms
    * Member Management Interface (Add/Remove members, role updates)
    * Member Participation and Status Views
    * Dedicated Member Portal screens
    * Group Dashboard UI and statistical widgets
    * Overall navigation and responsive mobile sidebar/hamburger menus
    * Frontend REST API client integration for group and member routes
  * **Supporting Payment UI Integration:**
    * Integrate payment-related screens with the overall dashboard layout
    * Integrate payment components into common dashboards where required
    * Maintain consistent UI/UX across payment, group, and member features
* **Main Deliverables:**
  * React frontend structure & routing
  * Group management screens
  * Member management screens
  * Dashboard interfaces
  * Common responsive UI components
  * Navigation and master layout
  * Frontend-backend API integration
  * Integration of payment-related frontend components

---

### 4. M.A. Hamas — Financial Discipline, Risk Detection, Analytics, Reports & Certificates
* **Assigned Work:**
  * Financial Discipline Score calculation algorithm implementation
  * Member discipline score history tracking
  * Score categories and Risk Levels (*Excellent, Good, Moderate, High-Risk*)
  * High-Risk member identification and organizer alerts
  * Reputation/reward badges and discipline points
  * Score trend analysis and historical graphing
  * Group performance analytics
  * Payment and contribution analytics
  * Member performance analytics
  * PDF Report Generation (monthly group summaries, payout receipts)
  * CSV Report Export functionality
  * Digital Certificate Generation upon successful Seettu completion
  * Certificate history and download portals
* **Main Deliverables:**
  * Financial discipline scoring module (`DisciplineScoreService.java`)
  * Risk detection and alerting functionality
  * Analytics and dashboard metric calculators
  * PDF report generator
  * CSV report export functionality
  * Digital certificate issuance module
  * Reporting and scoring documentation

#### 🧮 Financial Discipline Scoring Formula (SRS REQ-SCR-01):
$$\text{Score} = \max\left(0,\, 100 - \left[(\text{Late Payments} \times 5) + (\text{Missed Payments} \times 10) + (\text{Average Delay Days} \times 0.5)\right]\right)$$

* **Score Tiers:**
  * `80 – 100`: **Excellent** (Reliable borrower, eligible for high payout limits)
  * `65 – 79`: **Good** (Standard standing)
  * `50 – 64`: **Moderate** (Requires monitoring)
  * `< 50`: **High-Risk** (Restricted from early payouts)

---

### 5. N.M. Asrar — Dispute Management, Notifications & Testing
* **Assigned Work:**
  * Dispute Submission portal and user interfaces
  * Dispute types, categories, and evidence attachment details
  * Unique Dispute Reference ID generation
  * Dispute Status Management (`OPEN`, `UNDER_REVIEW`, `RESOLVED`, `REJECTED`)
  * Organizer dispute review and handling interface
  * Dispute comments, resolution notes, and audit history
  * Admin dispute escalation pathways
  * Dispute dashboard, metrics, and resolution timeline statistics
  * Notifications engine for critical events (due dates, missed cycles, payouts)
  * Functional testing across all user flows
  * Integration testing between frontend and backend
  * System feature testing and boundary condition tests
  * Bug identification, tracking, and verification reports
* **Main Deliverables:**
  * Dispute management module
  * Dispute dashboard and tracking views
  * Notification functionality (in-app & email alerts)
  * Functional test suite and test cases
  * Integration test cases
  * Test execution reports and defect tracking logs

---

### 6. W.V. Shashiprabha — Multi-Language, Audit, Export, Chatbot & Documentation
* **Assigned Work:**
  * Trilingual language support (**Sinhala**, **Tamil**, and **English**)
  * Dynamic language switching without page reload (SRS REQ-ACC-01)
  * Multi-language UI dictionary and text key management
  * Sinhala and Tamil Unicode font rendering and responsive typography
  * System-wide Audit Trail engine
  * Security activity logging (logins, role updates, record modifications)
  * Comprehensive User Action History
  * Data export support (group records, payment histories in CSV)
  * Database backup and disaster recovery support
  * AI/Rule-based Chatbot Assistant
  * FAQ-based chatbot answers for common user inquiries
  * Payment due-date assistance and reminder bots
  * Discipline score explanation assistant
  * Common task step-by-step guidance
  * Logging unanswered user queries for system improvements
  * User Manuals and System Documentation
* **Main Deliverables:**
  * Multi-language localization module (`translations.js`)
  * Audit trail and activity logging functionality
  * Data export utility
  * Backup and recovery documentation
  * Interactive Chatbot Assistant
  * User Manual and System Administrator documentation
  * Comprehensive feature documentation

---

## 🤝 Shared Team Responsibilities

All six members jointly participate in and contribute to:
1. **GitHub Repository Management:** Git branching strategy, pull requests, and commit hygiene.
2. **System & API Integration:** Aligning REST payload contracts and status codes.
3. **Code Reviews:** Peer reviews to ensure security, coding standards, and maintainability.
4. **Database Integration:** Schema review, foreign key enforcement, and test seed data.
5. **UI & Usability Review:** Cross-device testing for mobile and desktop responsiveness.
6. **Functional Testing & Bug Fixing:** Regression testing and defect resolution.
7. **Final System Integration:** Full end-to-end integration and staging deployment.
8. **Documentation & Viva Preparation:** SRS updates, final project report, slide deck, and live defense demonstration.

---

## 🗺️ SRS Alignment Summary

| SRS Feature Module | Responsible Member | Primary Tech / File Artifact |
| :--- | :--- | :--- |
| **User Authentication & RBAC** | A.J. Raaef | Spring Security, JWT, `AuthController.java` |
| **Group & Member Management** | B.A.P. Nethmi | React, `GroupController.java`, Member Views |
| **Database Design & Architecture** | M.R. Hanan | MySQL, `Schema.sql`, JPA Entities |
| **Payment Tracking & Seettu Cycle** | M.R. Hanan | `PaymentController.java`, `PaymentManagement.jsx` |
| **Financial Discipline Scoring** | M.A. Hamas | `DisciplineScoreService.java`, Score Tiers |
| **Risk Detection & Analytics** | M.A. Hamas | Metric Calculators, Risk Dashboards |
| **Reports & Certificates** | M.A. Hamas | iText PDF, CSV Export, Certificate Engine |
| **Dispute Management** | N.M. Asrar | `DisputeController.java`, Dispute Dashboard |
| **Event Notifications** | N.M. Asrar | `NotificationService.java`, Email / In-App Alerts |
| **Multi-Language Support (EN/SI/TA)** | W.V. Shashiprabha | `translations.js`, Unicode I18n Engine |
| **Audit Trail & Activity Logs** | W.V. Shashiprabha | AOP Interceptors, `AuditLog.java` |
| **Chatbot Assistant** | W.V. Shashiprabha | FAQ Rule Engine, Task Guidance |
| **System Security Safeguards** | A.J. Raaef + All Members | BCrypt, Method Security, CORS Config |
| **Quality Assurance & Testing** | N.M. Asrar + All Members | JUnit 5, Postman, Integration Test Suite |
| **Project Documentation & Report** | W.V. Shashiprabha + All Members | Final Project Report, User Guide, SRS |

---

## 🏗️ System Architecture & Technology Stack

```
   ┌────────────────────────────────────────────────────────┐
   │                   Presentation Layer                   │
   │      React 18 + Vite + Responsive CSS + I18n           │
   └───────────────────────────┬────────────────────────────┘
                               │ HTTP / JSON (Proxy /api)
   ┌───────────────────────────▼────────────────────────────┐
   │                    Application Layer                   │
   │  Spring Boot 3.2.x + Spring Security + REST Controllers│
   │  • PaymentService    • PaymentCycleService             │
   │  • DisciplineScore   • UserService / Security          │
   └───────────────────────────┬────────────────────────────┘
                               │ JPA / Hibernate ORM
   ┌───────────────────────────▼────────────────────────────┐
   │                    Data Storage Layer                  │
   │               MySQL 8.0+ (18 Relational Tables)        │
   └────────────────────────────────────────────────────────┘
```

* **Frontend:** React 18, Vite 5, Custom Line-Art SVG Icons, Responsive CSS Grid.
* **Backend:** Spring Boot 3.2.x, Java 17, Spring Data JPA, Spring Security, Lombok, Jakarta Validation.
* **Database:** MySQL 8.0+ with strict foreign key constraints and transaction rollback protection.

---

## 📁 Repository Structure

```
seetu-Manager/
├── backend/                              # Spring Boot REST API
│   ├── src/main/java/com/seettu/manager/
│   │   ├── config/                       # SecurityConfig, CorsConfig
│   │   ├── controller/                   # PaymentController, PaymentCycleController...
│   │   ├── dto/                          # Request/Response Data Transfer Objects
│   │   ├── entity/                       # JPA Database Entities (Payment, User, Group...)
│   │   ├── repository/                   # Spring Data JPA Repositories
│   │   ├── scheduler/                    # PaymentScheduler (daily automated checks)
│   │   └── service/                      # PaymentService, DisciplineScoreService...
│   ├── src/main/resources/
│   │   └── application.properties        # MySQL DB, JWT & server configuration (Port 8081)
│   └── pom.xml                           # Maven dependencies
├── frontend/                             # React SPA Client
│   ├── src/
│   │   ├── api/                          # paymentApi.js (REST fetch integration)
│   │   ├── components/
│   │   │   ├── common/                   # Line-art SVG Icons (Icons.jsx)
│   │   │   └── payments/                 # PaymentSummaryCards, Form, Table, Modal
│   │   ├── i18n/                         # translations.js (English, Sinhala, Tamil)
│   │   ├── pages/Payments/               # PaymentManagement.jsx (Master page)
│   │   ├── styles/                       # PaymentManagement.css
│   │   ├── App.jsx                       # Root Application component
│   │   └── main.jsx                      # Vite entry point
│   ├── package.json                      # Frontend dependencies
│   └── vite.config.js                    # Vite reverse-proxy configuration
├── database/                             # Database Scripts
│   ├── Schema.sql                        # Complete DDL with all 18 tables
│   └── Seed.sql                          # Initial test data & seed records
└── README.md                             # Project Documentation & Allocation
```

---

## 🚀 Getting Started & Local Setup Guide

### Prerequisites
1. **Java JDK 17+** (`java -version`)
2. **Apache Maven 3.8+** (`mvn -version`)
3. **Node.js 18+ & npm** (`node -v`, `npm -v`)
4. **MySQL Server 8.0+** (`mysql -u root -p`)

---

### Step 1: Database Setup
1. Open **MySQL Workbench** or MySQL CLI.
2. Run the database schema script:
   ```sql
   SOURCE database/Schema.sql;
   ```
3. Load the initial test seeds:
   ```sql
   SOURCE database/Seed.sql;
   ```

---

### Step 2: Backend Configuration & Startup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Verify `src/main/resources/application.properties` with your MySQL password:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   server.port=8081
   ```
3. Build and run the Spring Boot server:
   ```bash
   mvn clean compile
   mvn spring-boot:run
   ```
   *The backend will boot up at `http://localhost:8081`.*

---

### Step 3: Frontend Setup & Startup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Access the web application in your browser at `http://localhost:5173`.*

---

## 📡 Key Payment REST API Endpoints

| HTTP Method | Endpoint | Description | Query / Body Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments` | Record offline or bank contribution | `?recorderId={id}` + JSON body |
| `GET` | `/api/payments/group/{groupId}` | Retrieve all payments for a group | Path variable: `groupId` |
| `GET` | `/api/payments/group/{groupId}/summary` | Retrieve summary stats for cards | Path variable: `groupId` |
| `GET` | `/api/payments/member/{memberId}` | Retrieve payments by member | Path variable: `memberId` |
| `GET` | `/api/payments/member/{memberId}/score` | Calculate discipline score & tier | Path variable: `memberId` |
| `GET` | `/api/payment-cycles/group/{groupId}` | Retrieve rotational payout cycles | Path variable: `groupId` |

---

## 📄 License & Academic Declaration
This project is developed as the **Final Capstone Project** for the **National Diploma in Information Technology (NDIT)** at the **Institute of Technology, University of Moratuwa (ITUM)**, Sri Lanka.  
All intellectual rights are reserved by the authors and the university.
