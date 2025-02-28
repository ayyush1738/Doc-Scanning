# Document Scanning and Matching System

## Overview
This project is a **self-contained document scanning and matching system** with a built-in credit system. Users can upload plain text documents, and the system will scan and compare them against stored documents to find similar matches. The system includes **user authentication, role management, credit deduction, and an admin dashboard for analytics**.

## Features
### 1. **User Management & Authentication**
- User **Registration & Login** (Session-based authentication with JWT tokens and cookies).
- **User Roles:** Regular Users & Admins.
- Profile page displaying **user credits, past scans, and requested credits**.

### 2. **Credit System**
- Users **start with 20 free credits daily** (auto-reset at midnight).
- If credits run out, users must **request additional credits**.
- Admins can **approve/deny credit requests** and manually adjust user credits.
- Each document scan **deducts 1 credit** from the user balance.

### 3. **Document Scanning & Matching**
- Users can **upload .txt documents**.
- System scans the document and **finds similar stored documents**.
- Uses **Levenshtein distance algorithm** to measure text similarity.
- Users can **view past uploaded documents and their matches**.

### 4. **Admin Dashboard & Analytics**
- Track **total scans per day**.
- View **top users based on scans and credit usage**.
- **Identify most commonly scanned documents**.
- Manage **credit requests and manual credit adjustments**.
- View **detailed activity logs**.

## Tech Stack
### **Frontend:**
- HTML, CSS, JavaScript (VanillaJS)
- Fetch API for handling requests
- Hosted on **Netlify/Vercel** (if deployed separately)

### **Backend:**
- **Node.js (Express.js)** for server and API handling
- **SQLite3** as the database
- **bcrypt.js** for password hashing
- **jsonwebtoken** for authentication
- **multer** for file uploads
- **cors** for handling cross-origin requests

## Installation & Setup
### 1. **Clone the repository:**
```sh
git clone https://github.com/your-username/document-scanner.git
cd document-scanner
```

### 2. **Backend Setup:**
```sh
cd Backend
npm install
node index.js  # Start the server
```

### 3. **Frontend Setup:**
```sh
cd Frontend
open index.html  # Open in browser or deploy
```

## API Endpoints
### **Authentication Routes** (`/auth`)
- **POST** `/auth/register` → User registration
- **POST** `/auth/login` → User login
- **POST** `/auth/logout` → User logout
- **GET** `/auth/checkRole` → Check user role

### **User Routes** (`/user`)
- **GET** `/user/profile` → Get user profile & credits
- **POST** `/user/regularUser/upload` → Upload document for scanning
- **GET** `/user/regularUser/matches/:docId` → Get matching documents
- **POST** `/user/regularUser/requestCredits` → Request credits
- **GET** `/user/regularUser/open-file/:docId` → Open uploaded file

### **Admin Routes** (`/admin`)
- **GET** `/admin/dashboard` → Admin dashboard
- **GET** `/admin/analytics` → Get admin analytics
- **GET** `/admin/credit-requests` → View pending credit requests
- **POST** `/admin/approve-credit` → Approve credit request
- **POST** `/admin/deny-credit` → Deny credit request
- **POST** `/admin/update-credits` → Update user credits manually
- **GET** `/admin/activity-logs` → Get system activity logs

## Deployment
### **Option 1: Separate Frontend & Backend Deployment**
1. **Deploy Backend on Render/VPS:**
   - Remove `express.static()` from `app.js`.
   - Deploy using **Render, Railway, AWS, or VPS**.
   - Update frontend `scripts.js` to use backend URL.

2. **Deploy Frontend on Vercel/Netlify:**
   - Upload the frontend folder to Vercel/Netlify.
   - Ensure it correctly fetches from the deployed backend URL.

### **Option 2: Full Backend + Frontend Deployment**
1. **Build frontend:**
   ```sh
   npm run build  # If using React/Vite
   ```
2. **Move frontend build to backend public directory:**
   ```sh
   mv Frontend/build Backend/public
   ```
3. **Modify `app.js` to serve frontend:**
   ```js
   app.use(express.static(path.join(__dirname, "public")));
   app.get("*", (req, res) => {
       res.sendFile(path.join(__dirname, "public", "index.html"));
   });
   ```
4. **Deploy backend to a server.**

## Troubleshooting & FAQs
### 1. **Getting CORS issues?**
- Ensure backend has `Access-Control-Allow-Origin` properly configured.
- Modify `app.js`:
  ```js
  app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      next();
  });
  ```

### 2. **401 Unauthorized when calling API?**
- Ensure **cookies are enabled** in the browser.
- Use `credentials: "include"` in `fetch()` requests.
- Ensure `jwt.verify()` properly checks the token.

### 3. **Why are my credits not resetting?**
- Ensure the `node-schedule` cron job runs properly.
- Run manually:
  ```sh
  node -e "require('./Backend/src/models/user.model.js').resetCredits()"
  ```

## Future Improvements
- Implement **AI-powered document similarity detection** using NLP.
- Add **email notifications** for credit requests.
- Enhance **UI/UX** with a modern frontend framework (React/Vue).

## Contributors
- **Your Name** – Developer

## License
This project is licensed under the **MIT License**.

