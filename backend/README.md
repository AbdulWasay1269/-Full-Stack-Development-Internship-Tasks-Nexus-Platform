# Nexus – Investor & Entrepreneur Collaboration Platform

Welcome to the backend repository of **Nexus**. This platform enables secure networking between investors and entrepreneurs, bringing together features like WebRTC video calls, smart contract scheduling, document e-signatures, and test mode stripe transactions.

---

## 🚀 Features
- **Phase 1:** Express/MongoDB foundational setup.
- **Phase 2:** Advanced Auth System handling bcrypt hashing and JWT.
- **Phase 3:** Meeting system blocking double-booking constraints.
- **Phase 4:** Socket.io WebRTC gateway transmitting real-time Video Call ICE Candidates/Offers.
- **Phase 5:** Document Vault uploading buffers onto Native File-systems (with e-signature mapping).
- **Phase 6:** Stripe APIs processing mock transfers & withdrawals.
- **Phase 7:** Total Express Security wrapper (XSS, Sanitize, Rate-Limiting) paired with 2-Factor Authentication!

---

## 🛠 Project Installation

### Prerequisites
- Node.js (v16.14.0 or greater)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone & Install
```bash
git clone <your-repo-link>
cd backend
npm install
```

### 2. Configure Environment Variables
Inside the root of `/backend`, copy `.env.example` into a `.env` file containing:

```ini
NODE_ENV=development
PORT=5000

# MONGODB CONFIG
MONGO_URI=mongodb://localhost:27017/nexus_db

# JWT CONFIG
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# STRIPE SETUP
STRIPE_SECRET_KEY=sk_test_mock_key_for_now

# NODEMAILER / 2FA SMTP
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=some_user
SMTP_PASSWORD=some_pass
FROM_NAME=Nexus System
FROM_EMAIL=noreply@nexus.com
```

### 3. Run Development Server
```bash
npm run dev # If using nodemon
# OR
node server.js
```
The application will safely spin up on `http://localhost:5000`.

---

## 🌐 API Endpoints Overview

| Module        | Method | Endpoint                        | Description                                     | Access  |
| ------------- | ------ | ------------------------------- | ----------------------------------------------- | ------- |
| **Auth**      | POST   | `/api/auth/register`            | Register user                                   | Public  |
|               | POST   | `/api/auth/login`               | Trigger Login -> Issues 2FA OTP                  | Public  |
|               | POST   | `/api/auth/verify-otp`          | Validate OTP & get JWT token                    | Public  |
|               | GET    | `/api/auth/me`                  | Get session profile                             | Private |
| **Meetings**  | GET    | `/api/meetings`                 | Fetch your meetings                             | Private |
|               | POST   | `/api/meetings`                 | Create meeting & check conflicts                | Private |
|               | PUT    | `/api/meetings/:id/status`      | Accept / Reject / Cancel                        | Private |
| **Documents** | GET    | `/api/documents`                | Vault view files                                | Private |
|               | POST   | `/api/documents`                | Multer upload single PDF/DOC                    | Private |
|               | PUT    | `/api/documents/:id/sign`       | Securely E-Sign via Web-Canvas base64 injection | Private |
| **Payments**  | POST   | `/api/payments/deposit`         | Create Stripe Payment Intent                    | Private |
|               | POST   | `/api/payments/withdraw`        | Mock withdrawal logic                           | Private |
|               | GET    | `/api/payments/history`         | Ledger data array                               | Private |

---

## ☁️ Deployment Guide

### Deploying the Backend to Render:

1. **Push your code to GitHub.**
2. Log into **Render** (render.com).
3. Create a **New Web Service**, targeting your repository.
4. Set Build Command: `npm install`
5. Set Start Command: `node server.js`
6. Add **Environmental Variables** matching your `.env` (Make sure you construct a Mongo Atlas cluster to replace local DB paths).

### Deploying Frontend to Vercel:

1. Inside your frontend React Repo, push code to GitHub.
2. In React context path, map `.env.local` to point `REACT_APP_API_URL` -> `<Render API Link>`.
3. Select 'New Project' on Vercel mapping github repo.
4. Auto-build runs `npm run build` and spins it online seamlessly.

---

> Built progressively maintaining Production Grade structures 🚀
