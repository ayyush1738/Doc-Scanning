# Document Scanning & Matching System

## Overview
This project is a **self-contained document scanning and matching system** that allows users to upload documents, scan them for similarity, and request additional credits. It includes **session-based role authentication using JWT** and a credit system for limiting document scans. The system provides an **admin dashboard** for analytics and credit approvals.

## Features
- **User Authentication** (JWT-based login & role management)
- **Document Upload & Scanning**
- **Text Similarity Matching** (Levenshtein Distance Algorithm)
- **Daily Free Credits System (Auto Reset at Midnight)**
- **Admin Credit Approval System**
- **Activity Logging & User Statistics**
- **User & Admin Dashboards**

---

## Tech Stack
- **Backend:** Node.js (Express.js), SQLite (Database), JWT (Authentication)
- **Frontend:** HTML, CSS, JavaScript
- **Storage:** Local file storage for document uploads
- **Session Management:** JWT-based authentication

---

## Installation & Setup
### Prerequisites
Ensure you have **Node.js** and **SQLite** installed on your system.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/ayyush1738/Doc-Scanning.git
   cd Doc-Scanning
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:3000`.

4. Open the frontend by launching `http://localhost:3000` in your browser.

---

## API Routes
### **Authentication**
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get a JWT session |
| POST | `/auth/logout` | Logout and clear session |
| GET | `/auth/checkRole` | Check logged-in user role |

### **User Routes**
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/user/profile` | Get user profile details |
| POST | `/user/regularUser/upload` | Upload document for scanning |
| GET | `/user/regularUser/matches/:docId` | Get matching documents |
| POST | `/user/regularUser/requestCredits` | Request additional credits |
| GET | `/user/regularUser/open-file/:docId` | Open document file |

### **Admin Routes**
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/admin/dashboard` | Access admin dashboard |
| GET | `/admin/analytics` | Get analytics (top users, scans, credit usage) |
| GET | `/admin/credit-requests` | View pending credit requests |
| POST | `/admin/approve-credit` | Approve a credit request |
| POST | `/admin/deny-credit` | Deny a credit request |
| POST | `/admin/update-credits` | Manually update user credits |
| GET | `/admin/activity-logs` | View all activity logs |

---

## Credit System
- **Users get 20 free credits per day** (Auto-reset at midnight)
- **Each document scan deducts 1 credit**
- **Admins can approve additional credits** if requested
- **Admins have unlimited credits**

---

## Document Scanning & Matching
- **Uploads are stored locally**
- **Text similarity is checked using Levenshtein Distance Algorithm**
- **Only documents with similarity >70% are matched**

---

## User Roles
- **Regular User:** Can scan documents, check matches, and request credits.
- **Admin:** Can view analytics, approve/deny credit requests, and monitor user activity.

---

## Test Files
- Test files for API and authentication testing are included in the repository.
- Located in `tests/` folder.

---

## Screenshots
(Add screenshots of the dashboard, profile, document scanning, and matching results)

---

## Authors
- Ayush Singh Rathore

---

## License
This project is licensed under the MIT License.

