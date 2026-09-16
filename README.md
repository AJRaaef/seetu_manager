EETTUMANAGER - TEAM MEMBER SETUP INSTRUCTIONS
STEP 1: PREREQUISITES
Each member must have these installed:

Software	Version	Download Link
Java JDK	17 or 21	https://adoptium.net/
Maven	3.9+	https://maven.apache.org/download.cgi
MySQL	8.0+	https://dev.mysql.com/downloads/installer/
Node.js	18+	https://nodejs.org/
Git	Latest	https://git-scm.com/download/win
VS Code	Latest	https://code.visualstudio.com/
STEP 2: CLONE THE REPOSITORY
Open VS Code Terminal (PowerShell) and run:

powershell
# Go to Desktop or any folder
cd C:\Users\YourName\Desktop

# Clone the repository
git clone https://github.com/AJRaaef/seetu_manager.git

# Go into the project folder
cd seetu_manager
STEP 3: SWITCH TO dev BRANCH
powershell
# Switch to dev branch (has all code)
git checkout dev

# Verify you're on dev
git branch
Expected Output:

text
* dev
  main
  backend
  frontend
  database
STEP 4: SETUP DATABASE
Step 4.1: Open MySQL
powershell
mysql -u root -p
Enter your MySQL password (or press Enter if no password).

Step 4.2: Create Database
sql
CREATE DATABASE seettu_manager;
USE seettu_manager;
Step 4.3: Run Schema
sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
Step 4.4: Verify Tables
sql
SHOW TABLES;
You should see 18 tables.

Step 4.5: Exit MySQL
sql
EXIT;
STEP 5: CONFIGURE BACKEND
Step 5.1: Open application.properties
Navigate to:

text
backend/src/main/resources/application.properties
Step 5.2: Update Database Credentials
properties
spring.datasource.url=jdbc:mysql://localhost:3306/seettu_manager?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE
Important: Replace YOUR_MYSQL_PASSWORD_HERE with your actual MySQL password. If no password, leave it empty.

STEP 6: RUN BACKEND
Open VS Code Terminal and run:

powershell
# Go to backend folder
cd backend

# Clean and install dependencies
mvn clean install

# Run Spring Boot
mvn spring-boot:run
Expected Output:

text
Started SeettuManagerApplication in X.XXX seconds
Tomcat started on port 8080
Keep this terminal open! Backend must keep running.

STEP 7: RUN FRONTEND
Open a NEW VS Code Terminal (don't close backend terminal):

powershell
# Go to frontend folder
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
Expected Output:

text
VITE v5.0.0  ready in 500 ms
➜  Local:   http://localhost:5173/
STEP 8: ACCESS THE SYSTEM
Open browser and go to:

text
http://localhost:5173
Login Credentials:
Role	Email	Password
Admin	admin@seetumanager.com	Hello@12345
Organizer	org@gmail.com	Hello@12345
Member	user@gmail.com	Hello@12345
asrar asrar123@gmail.com	Hello@12345