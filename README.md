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
# API Documentation

## Overview
This document provides API endpoints for both Admin and User roles, detailing their request methods, responses, and expected behavior.

---

# **Admin APIs**

## 1. Get Analytics Data
**Endpoint:** `GET /admin/analytics`

**Response:**
```json
{
    "total_scans_today": 23,
    "top_topics": [
        "hero4.txt", "hero6.txt", "hero3.txt", "hero5.txt", "hero2.txt", "hero1.txt", "imp.txt"
    ],
    "top_users": [
        { "username": "John", "total_scans": 27 },
        { "username": "Jack", "total_scans": 21 },
        { "username": "Ayush", "total_scans": 0 }
    ],
    "user_scans": [
        { "id": 1, "username": "Ayush", "scans_today": 0, "total_scans": 0, "credits": 20, "pending_requests": 0 },
        { "id": 2, "username": "Jack", "scans_today": 21, "total_scans": 21, "credits": 0, "pending_requests": 5 },
        { "id": 3, "username": "John", "scans_today": 2, "total_scans": 27, "credits": 15, "pending_requests": 0 }
    ],
    "credits_used": [
        { "id": 1, "username": "Ayush", "credits_used": 0 },
        { "id": 2, "username": "Jack", "credits_used": 21 },
        { "id": 3, "username": "John", "credits_used": 2 }
    ],
    "top_credits": [
        { "id": 2, "username": "Jack", "top_credits": 21 },
        { "id": 3, "username": "John", "top_credits": 2 },
        { "id": 1, "username": "Ayush", "top_credits": 0 }
    ]
}
```

---

## 2. Get Credit Requests
**Endpoint:** `GET /admin/credit-requests`

**Response:**
```json
{"requests":[{"id":11,"username":"Jack","requested_credits":5}]}
```

---

## 3. Get Activity Logs
**Endpoint:** `GET /admin/activity-logs`

**Response:**
```json
{
    "logs": [
        { "id": 28, "username": "Jack", "action": "Credit Request", "details": "Requested 5 credits", "timestamp": "2025-02-28 18:12:33" },
        { "id": 27, "username": "Jack", "action": "Document Scan", "details": "Scanned file: hero1.txt", "timestamp": "2025-02-28 18:12:25" }
    ]
}
```

---

## 4. Deny Credit Request
**Endpoint:** `POST /admin/deny-credit`

**Response:**
```json
{"message":"Credit request denied successfully."}
```

---

## 5. Update User Credits
**Endpoint:** `POST /admin/update-credits`

**Response:**
```json
{"success":true,"message":"User credits updated to 1."}
```

---

# **User APIs**

## 1. Check User Role
**Endpoint:** `GET /auth/checkRole`

**Response:**
```json
{"role":"user"}
```

---

## 2. Get User Profile
**Endpoint:** `GET /user/profile?username=Jack`

**Response:**
```json
{
    "id": 2,
    "username": "Jack",
    "role": "user",
    "credits": 2,
    "pastScans": [
        { "id": 27, "filename": "hero3.txt", "upload_date": "2025-02-27 19:08:43" }
    ]
}
```

---

## 3. Upload Document
**Endpoint:** `POST /user/regularUser/upload`

**Response:**
```json
{
    "message": "File uploaded successfully!",
    "document": { "filename": "hero5.txt", "upload_date": "2025-02-28 18:19:10" }
}
```

---

## 4. Get Document Matches
**Endpoint:** `GET /user/regularUser/matches/29?username=Jack`

**Response:**
```json
{
    "sourceDocument": { "id": 29, "filename": "hero4.txt" },
    "matches": [
        { "id": 35, "filename": "hero4.txt", "similarity": "1.00" },
        { "id": 41, "filename": "hero4.txt", "similarity": "1.00" }
    ]
}
```

---

## 5. Request Credits
**Endpoint:** `POST /user/regularUser/requestCredits`

**Response (Denied):**
```json
{"message": "Credit request denied. You can only request credits when your balance is 0."}
```

**Response (Accepted):**
```json
{"message":"Request Submitted Successfully","requested_credits":4}
```

---

# **Notes**
- All endpoints require authentication.
- Responses are JSON formatted.
- Use appropriate HTTP methods (`GET`, `POST`).
- Ensure the request body is correctly formatted when sending `POST` requests.



---

## Authors
- Ayush Singh Rathore

---

## License
This project is licensed under the MIT License.

